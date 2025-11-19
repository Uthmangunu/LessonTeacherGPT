from typing import List, Optional

from pydantic import BaseModel, Field


class ConceptPayload(BaseModel):
    title: str
    summary: str
    priority: int = Field(0, ge=0)
    embedding: List[float] = Field(default_factory=list)


class ConceptRequest(BaseModel):
    material_id: int
    text: str


class ConceptResponse(BaseModel):
    concepts: List[ConceptPayload]


class TranscriptSegmentPayload(BaseModel):
    text: str
    start: float
    end: float
    embedding: Optional[List[float]] = None


class MatchRequest(BaseModel):
    concept_embedding: List[float]
    transcript_segments: List[TranscriptSegmentPayload]
    threshold: float = 0.7
    top_k: int = 3


class MatchResult(BaseModel):
    start: float
    end: float
    similarity: float
    text: str


class MatchResponse(BaseModel):
    matches: List[MatchResult]
