from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Concept, ConceptMatch, LearningMaterial, TranscriptSegment, VideoResource

User = get_user_model()


class TranscriptSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TranscriptSegment
        fields = ["id", "start_seconds", "end_seconds", "text"]


class VideoResourceSerializer(serializers.ModelSerializer):
    segments = TranscriptSegmentSerializer(many=True, read_only=True)

    class Meta:
        model = VideoResource
        fields = ["id", "video_id", "title", "channel_title", "thumbnail_url", "segments"]


class ConceptMatchSerializer(serializers.ModelSerializer):
    segment = TranscriptSegmentSerializer()
    video = serializers.SerializerMethodField()

    class Meta:
        model = ConceptMatch
        fields = ["id", "similarity", "rationale", "segment", "video"]

    def get_video(self, obj):
        return VideoResourceSerializer(obj.segment.video).data


class ConceptSerializer(serializers.ModelSerializer):
    matches = ConceptMatchSerializer(many=True, read_only=True)

    class Meta:
        model = Concept
        fields = ["id", "title", "summary", "priority", "matches"]


class LearningMaterialSerializer(serializers.ModelSerializer):
    concepts = ConceptSerializer(many=True, read_only=True)
    owner = serializers.SerializerMethodField()

    class Meta:
        model = LearningMaterial
        fields = [
            "id",
            "title",
            "source_type",
            "status",
            "text_content",
            "metadata",
            "owner",
            "concepts",
            "created_at",
        ]
        read_only_fields = ["status", "metadata", "concepts", "created_at"]

    def get_owner(self, obj):
        if obj.owner:
            return {"id": obj.owner.id, "username": obj.owner.get_username()}
        return None


class LearningMaterialUploadSerializer(serializers.ModelSerializer):
    """Serializer dedicated to POST /api/upload-material/."""

    class Meta:
        model = LearningMaterial
        fields = ["id", "title", "source_type", "original_file", "text_content"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        user = self.context["request"].user if self.context.get("request") else None
        return LearningMaterial.objects.create(owner=user, **validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )
