from django.contrib import admin

from .models import Concept, ConceptMatch, LearningMaterial, TranscriptSegment, VideoResource


@admin.register(LearningMaterial)
class LearningMaterialAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "status", "created_at")
    search_fields = ("title", "owner__username")
    list_filter = ("status",)


@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    list_display = ("title", "material", "priority")
    search_fields = ("title",)


@admin.register(VideoResource)
class VideoResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "video_id", "channel_title")
    search_fields = ("title", "video_id")


@admin.register(TranscriptSegment)
class TranscriptSegmentAdmin(admin.ModelAdmin):
    list_display = ("video", "start_seconds", "end_seconds")
    search_fields = ("video__title",)


@admin.register(ConceptMatch)
class ConceptMatchAdmin(admin.ModelAdmin):
    list_display = ("concept", "segment", "similarity")
    list_filter = ("concept__material",)
