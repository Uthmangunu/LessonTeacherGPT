import logging
from typing import List

from celery import shared_task
from django.db import transaction

from .models import Concept, ConceptMatch, LearningMaterial, TranscriptSegment, VideoResource
from .services import concept_extractor, embedding_matcher, embedding_service, transcript_service, youtube_service

logger = logging.getLogger(__name__)


@shared_task
def process_learning_material(material_id: int) -> None:
    """Primary orchestration task triggered after upload."""
    try:
        material = LearningMaterial.objects.get(id=material_id)
    except LearningMaterial.DoesNotExist:
        logger.error("Material %s does not exist", material_id)
        return

    material.status = LearningMaterial.ProcessingStatus.EXTRACTING
    material.save(update_fields=["status", "updated_at"])

    concepts = concept_extractor.extract_concepts(material.id, material.text_content)
    concept_objs = _persist_concepts(material, concepts)

    for concept in concept_objs:
        videos = youtube_service.search_videos(f"{material.title} {concept.title}")
        _match_concept_to_videos(concept, videos)

    material.status = LearningMaterial.ProcessingStatus.READY
    material.save(update_fields=["status", "updated_at"])
    logger.info("Material %s processed with %s concepts", material_id, len(concept_objs))


def _persist_concepts(material: LearningMaterial, concepts_payload: List[dict]) -> List[Concept]:
    concepts = []
    for payload in concepts_payload:
        embedding = payload.get("embedding")
        if not embedding:
            embedding = embedding_service.embed_text(payload.get("summary") or payload["title"])
        concept = Concept.objects.create(
            material=material,
            title=payload.get("title", "Concept"),
            summary=payload.get("summary", ""),
            priority=payload.get("priority", 0),
            embedding=embedding,
        )
        concepts.append(concept)
    return concepts


def _match_concept_to_videos(concept: Concept, videos: List[dict]) -> None:
    for video in videos:
        video_obj = youtube_service.ensure_video_resource(video, VideoResource)
        transcript = transcript_service.fetch_transcript(video["video_id"])
        segments_data = transcript_service.chunk_transcript(transcript)
        stored_segments = []
        for segment in segments_data:
            seg_obj, _ = TranscriptSegment.objects.get_or_create(
                video=video_obj,
                start_seconds=segment["start"],
                end_seconds=segment["end"],
                defaults={
                    "text": segment["text"],
                    "embedding": embedding_service.embed_text(segment["text"]),
                },
            )
            stored_segments.append(seg_obj)
        _persist_matches(concept, stored_segments)


@transaction.atomic
def _persist_matches(concept: Concept, segments: List[TranscriptSegment]) -> None:
    match_candidates = [
        {
            "segment": segment,
            "embedding": segment.embedding,
            "video_id": segment.video.video_id,
            "start_seconds": segment.start_seconds,
            "end_seconds": segment.end_seconds,
        }
        for segment in segments
    ]
    scored = embedding_matcher.match_concept_to_segments(
        concept.embedding,
        match_candidates,
    )
    for entry in scored:
        ConceptMatch.objects.update_or_create(
            concept=concept,
            segment=entry["segment"],
            defaults={"similarity": entry["similarity"], "rationale": "Auto-matched"},
        )
