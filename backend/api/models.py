from django.conf import settings
from django.db import models


class TimestampedModel(models.Model):
    """Common metadata across entities."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class LearningMaterial(TimestampedModel):
    """Represents an uploaded or ingested study source."""

    class SourceType(models.TextChoices):
        UPLOAD = "upload", "Upload"
        LINK = "link", "External Link"

    class ProcessingStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        EXTRACTING = "extracting", "Extracting"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="learning_materials",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    source_type = models.CharField(
        max_length=32, choices=SourceType.choices, default=SourceType.UPLOAD
    )
    original_file = models.FileField(upload_to="materials/", null=True, blank=True)
    text_content = models.TextField(blank=True)
    status = models.CharField(
        max_length=32, choices=ProcessingStatus.choices, default=ProcessingStatus.PENDING
    )
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return self.title


class Concept(TimestampedModel):
    """Domain concept extracted from a learning material."""

    material = models.ForeignKey(
        LearningMaterial, on_delete=models.CASCADE, related_name="concepts"
    )
    title = models.CharField(max_length=255)
    summary = models.TextField(blank=True)
    embedding = models.JSONField(default=list, blank=True)
    priority = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return f"{self.material_id}::{self.title}"


class VideoResource(TimestampedModel):
    """Metadata for a YouTube video referenced by the pipeline."""

    video_id = models.CharField(max_length=32, unique=True)
    title = models.CharField(max_length=500)
    channel_title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    thumbnail_url = models.URLField(blank=True)

    def __str__(self) -> str:
        return self.title


class TranscriptSegment(TimestampedModel):
    """Individual transcript segments with embeddings for similarity search."""

    video = models.ForeignKey(
        VideoResource, on_delete=models.CASCADE, related_name="segments"
    )
    start_seconds = models.FloatField()
    end_seconds = models.FloatField()
    text = models.TextField()
    embedding = models.JSONField(default=list, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["video", "start_seconds"]),
        ]

    def __str__(self) -> str:
        return f"{self.video.video_id}@{self.start_seconds:.2f}s"


class ConceptMatch(TimestampedModel):
    """Stores the best timestamp mappings between a concept and transcript segments."""

    concept = models.ForeignKey(
        Concept, on_delete=models.CASCADE, related_name="matches"
    )
    segment = models.ForeignKey(
        TranscriptSegment, on_delete=models.CASCADE, related_name="concept_matches"
    )
    similarity = models.FloatField()
    rationale = models.TextField(blank=True)

    class Meta:
        unique_together = ("concept", "segment")
        ordering = ["-similarity"]

    def __str__(self) -> str:
        return f"Concept {self.concept_id} -> Segment {self.segment_id}"
