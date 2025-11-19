from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import services
from .schemas import ConceptRequest, ConceptResponse, MatchRequest, MatchResponse

app = FastAPI(
    title="LessonTeacherGPT AI Service",
    version="0.1.0",
    description="FastAPI microservice that handles concept extraction and transcript matching.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/concepts/extract", response_model=ConceptResponse)
def extract_concepts(payload: ConceptRequest):
    concepts = services.extract_concepts(payload.text)
    return ConceptResponse(concepts=concepts)


@app.post("/concepts/match", response_model=MatchResponse)
def match_concepts(payload: MatchRequest):
    matches = services.match_segments(
        payload.concept_embedding,
        [segment.model_dump() for segment in payload.transcript_segments],
        payload.threshold,
        payload.top_k,
    )
    return MatchResponse(matches=matches)
