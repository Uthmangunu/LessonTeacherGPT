from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, viewsets

from .models import Concept, LearningMaterial
from .serializers import (
    ConceptSerializer,
    LearningMaterialSerializer,
    LearningMaterialUploadSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from .tasks import process_learning_material

User = get_user_model()


class RegistrationView(generics.CreateAPIView):
    """Simple endpoint for onboarding users before JWT auth."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class LearningMaterialUploadView(generics.CreateAPIView):
    serializer_class = LearningMaterialUploadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        material = serializer.save()
        process_learning_material.delay(material.id)


class LearningMaterialViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LearningMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningMaterial.objects.filter(owner=self.request.user).order_by("-created_at")


class MaterialConceptListView(generics.ListAPIView):
    serializer_class = ConceptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        material_id = self.kwargs["material_id"]
        return Concept.objects.filter(material_id=material_id, material__owner=self.request.user)
