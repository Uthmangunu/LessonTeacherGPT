from __future__ import annotations

import hashlib
import math
from typing import List


def extract_concepts(text: str, limit: int = 5):
    sentences = [sentence.strip() for sentence in text.split(".") if sentence.strip()]
    if not sentences:
        return []
    return [
        {
            "title": f"Concept {idx + 1}: {sentence[:60]}",
            "summary": sentence,
            "priority": idx,
            "embedding": _pseudo_embedding(sentence),
        }
        for idx, sentence in enumerate(sentences[:limit])
    ]


def match_segments(
    concept_embedding: List[float],
    transcript_segments: List[dict],
    threshold: float,
    top_k: int,
):
    scored = []
    for segment in transcript_segments:
        embedding = segment.get("embedding") or _pseudo_embedding(segment["text"])
        score = _cosine_similarity(concept_embedding, embedding)
        if score >= threshold:
            scored.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "similarity": score,
                    "text": segment["text"],
                },
            )
    scored.sort(key=lambda item: item["similarity"], reverse=True)
    return scored[:top_k]


def _pseudo_embedding(text: str):
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    return [int(byte) / 255 for byte in digest[:24]]


def _cosine_similarity(vec_a: List[float], vec_b: List[float]):
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot = sum(x * y for x, y in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(x * x for x in vec_a))
    mag_b = math.sqrt(sum(y * y for y in vec_b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)
