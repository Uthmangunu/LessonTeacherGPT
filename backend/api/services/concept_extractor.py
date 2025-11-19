"""
Utilities that call the FastAPI AI microservice to extract concepts from text.
Falls back to a very naive heuristic so local development can continue without the AI layer.
"""

from __future__ import annotations

import logging
from typing import Dict, List

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def extract_concepts(material_id: int, text: str) -> List[Dict]:
    if not text.strip():
        logger.info("Material %s has no text to extract concepts from", material_id)
        return []

    payload = {"material_id": material_id, "text": text}
    try:
        response = requests.post(
            f"{settings.AI_SERVICE_BASE_URL}/concepts/extract",
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("concepts", [])
    except Exception as exc:  # noqa: BLE001
        logger.warning("Falling back to heuristic concept extraction: %s", exc)
        return _fallback_concepts(text)


def _fallback_concepts(text: str) -> List[Dict]:
    """Simple baseline: use the first few sentences as 'concepts'."""
    sentences = [s.strip() for s in text.split(".") if s.strip()]
    concepts = []
    for idx, sentence in enumerate(sentences[:5]):
        concepts.append(
            {
                "title": f"Concept {idx + 1}",
                "summary": sentence,
                "embedding": [],
                "priority": idx,
            }
        )
    return concepts
