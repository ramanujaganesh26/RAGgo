from fastapi import APIRouter
from ..core.config import settings
from ..services.ragflow_client import ragflow_client

router = APIRouter(tags=["Health"])


@router.get("/health")
async def get_system_health():
    """
    Reports Gateway status and downstream RAGFlow engine connectivity.
    """
    upstream_health = await ragflow_client.check_health()
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env,
        "services": {
            "gateway": {"status": "online"},
            "ragflow_engine": upstream_health,
        },
    }
