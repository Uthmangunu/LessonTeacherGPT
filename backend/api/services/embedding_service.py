"""
Lightweight wrapper for generating embeddings via OpenAI.
Falls back to deterministic pseudo-embeddings for offline development.
"""

from __future__ import annotations

import hashlib
import logging
from typing import List

from django.conf import settings

try:
    from openai import OpenAI

    _openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
except Exception:  # noqa: BLE001
    _openai_client = None

logger = logging.getLogger(__name__)


def embed_text(text: str, model: str = "text-embedding-3-small") -> List[float]:
    if _openai_client is None:
        logger.warning("OpenAI client not configured; using fallback embeddings")
        return _fallback_embedding(text)

    try:
        response = _openai_client.embeddings.create(model=model, input=text)
    except Exception as exc:  # noqa: BLE001
        logger.error("Embedding request failed (%s); using fallback", exc)
        return _fallback_embedding(text)

    return response.data[0].embedding


def _fallback_embedding(text: str) -> List[float]:
    """Return a pseudo-embedding derived from the text hash."""
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    # Produce a small deterministic vector
    return [int(b) / 255 for b in digest[:16]]
