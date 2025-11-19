"""
YouTube search helpers.
Uses the official Data API when an API key is present, otherwise returns stubbed data.
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional

from django.conf import settings

try:
    from googleapiclient.discovery import build
except Exception:  # noqa: BLE001
    build = None

logger = logging.getLogger(__name__)


def search_videos(query: str, max_results: int = 5) -> List[Dict]:
    api_key = settings.YOUTUBE_API_KEY
    if not api_key or build is None:
        logger.info("No YOUTUBE_API_KEY configured; returning stubbed video list")
        return _stubbed_videos(query)

    try:
        youtube = build("youtube", "v3", developerKey=api_key)
        response = (
            youtube.search()
            .list(q=query, part="id,snippet", maxResults=max_results, type="video")
            .execute()
        )
        return [
            {
                "video_id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "channel_title": item["snippet"]["channelTitle"],
                "description": item["snippet"]["description"],
                "thumbnail_url": item["snippet"]["thumbnails"]["default"]["url"],
            }
            for item in response.get("items", [])
        ]
    except Exception as exc:  # noqa: BLE001
        logger.error("YouTube search failed (%s); returning stubbed data", exc)
        return _stubbed_videos(query)


def _stubbed_videos(query: str) -> List[Dict]:
    base_id = abs(hash(query)) % 1_000_000
    return [
        {
            "video_id": f"demo-{base_id + idx}",
            "title": f"Demo video {idx + 1} for {query}",
            "channel_title": "LessonTeacherGPT",
            "description": "Placeholder video metadata.",
            "thumbnail_url": "https://placehold.co/320x180",
        }
        for idx in range(3)
    ]


def ensure_video_resource(video_data: Dict, video_model) -> Optional[object]:
    """
    Convenience helper to create or fetch a VideoResource.
    `video_model` is injected so the service remains framework-agnostic.
    """

    video_id = video_data["video_id"]
    obj, _ = video_model.objects.get_or_create(
        video_id=video_id,
        defaults={
            "title": video_data["title"],
            "channel_title": video_data.get("channel_title", ""),
            "description": video_data.get("description", ""),
            "thumbnail_url": video_data.get("thumbnail_url", ""),
        },
    )
    return obj
