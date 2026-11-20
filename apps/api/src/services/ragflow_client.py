import httpx
from typing import Any, Dict, List, Optional
from ..core.config import settings


class RAGFlowClient:
    """
    Asynchronous client for interacting with the foundational RAGFlow engine (/api/v1).
    Provides resilient request execution with automatic failure reporting.
    """

    def __init__(self):
        self.base_url = settings.ragflow_base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {settings.ragflow_api_key}",
            "Accept": "application/json",
        }
        self.timeout = httpx.Timeout(settings.ragflow_timeout_seconds)

    async def check_health(self) -> Dict[str, Any]:
        """Verify health status of the upstream RAGFlow service."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/system/healthz", headers=self.headers)
                if response.status_code == 200:
                    return {"status": "healthy", "upstream": "ragflow", "reachable": True}
                return {"status": "degraded", "upstream": "ragflow", "reachable": True, "code": response.status_code}
        except httpx.RequestError as exc:
            return {"status": "unreachable", "upstream": "ragflow", "reachable": False, "error": str(exc)}

    async def list_datasets(self) -> List[Dict[str, Any]]:
        """Fetch datasets from RAGFlow."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/datasets", headers=self.headers)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("data", [])
                return []
        except httpx.RequestError:
            return []

    async def create_dataset(self, name: str, parser_id: str = "general") -> Dict[str, Any]:
        """Create a new dataset in RAGFlow."""
        payload = {"name": name, "parser_id": parser_id}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            res = await client.post(f"{self.base_url}/datasets", json=payload, headers=self.headers)
            res.raise_for_status()
            return res.json().get("data", {})


ragflow_client = RAGFlowClient()
