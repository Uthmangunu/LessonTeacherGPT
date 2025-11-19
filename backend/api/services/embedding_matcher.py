"""
Matching helpers that align concept embeddings with transcript segments.
"""

from __future__ import annotations

import logging
import math
from typing import Dict, Iterable, List

logger = logging.getLogger(__name__)


def cosine_similarity(vec_a: Iterable[float], vec_b: Iterable[float]) -> float:
    a = list(vec_a)
    b = list(vec_b)
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(y * y for y in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def match_concept_to_segments(
    concept_embedding: List[float],
    transcript_segments: List[Dict],
    similarity_threshold: float = 0.7,
    top_k: int = 3,
) -> List[Dict]:
    scored = []
    for segment in transcript_segments:
        score = cosine_similarity(concept_embedding, segment.get("embedding", []))
        if score >= similarity_threshold:
            scored.append({**segment, "similarity": score})
    scored.sort(key=lambda entry: entry["similarity"], reverse=True)
    logger.debug("Matched %s segments over threshold %.2f", len(scored), similarity_threshold)
    return scored[:top_k]
