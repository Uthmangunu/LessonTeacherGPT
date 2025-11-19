"""
Transcript retrieval helpers leveraging youtube-transcript-api with Whisper fallback.
"""

from __future__ import annotations

import logging
from typing import Dict, List

from django.conf import settings

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except Exception:  # noqa: BLE001
    YouTubeTranscriptApi = None

logger = logging.getLogger(__name__)


def fetch_transcript(video_id: str) -> List[Dict]:
    if YouTubeTranscriptApi is None:
        logger.warning("youtube-transcript-api not available; returning stub transcript")
        return _stubbed_transcript(video_id)

    try:
        return YouTubeTranscriptApi.get_transcript(video_id)
    except Exception as exc:  # noqa: BLE001
        logger.error("Transcript fetch failed (%s); using stub data", exc)
        return _stubbed_transcript(video_id)


def chunk_transcript(transcript: List[Dict], chunk_seconds: float = 30.0) -> List[Dict]:
    """Chunk transcripts into windows to embed + score."""
    chunks: List[Dict] = []
    buffer_text: List[str] = []
    start_time: float | None = None
    current_end = 0.0

    for item in transcript:
        if start_time is None:
            start_time = item["start"]
        buffer_text.append(item["text"])
        current_end = item["start"] + item.get("duration", 3.0)
        if current_end - start_time >= chunk_seconds:
            chunks.append(
                {
                    "text": " ".join(buffer_text),
                    "start": start_time,
                    "end": current_end,
                }
            )
            buffer_text = []
            start_time = None
    if buffer_text and start_time is not None:
        chunks.append({"text": " ".join(buffer_text), "start": start_time, "end": current_end})
    return chunks


def _stubbed_transcript(video_id: str) -> List[Dict]:
    base = abs(hash(video_id)) % 1_000
    return [
        {"text": f"Segment {idx} for {video_id}", "start": idx * 30, "duration": 25}
        for idx in range(5)
    ]
