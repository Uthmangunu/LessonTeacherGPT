from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    LearningMaterialUploadView,
    MaterialConceptListView,
    RegistrationView,
    LearningMaterialViewSet,
)

router = DefaultRouter()
router.register(r"materials", LearningMaterialViewSet, basename="materials")

urlpatterns = [
    path("auth/register/", RegistrationView.as_view(), name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("upload-material/", LearningMaterialUploadView.as_view(), name="upload-material"),
    path("materials/<int:material_id>/concepts/", MaterialConceptListView.as_view(), name="material-concepts"),
    path("", include(router.urls)),
]
