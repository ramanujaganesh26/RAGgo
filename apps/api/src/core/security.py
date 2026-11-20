import logging
import json
from datetime import datetime, timezone
from typing import Optional
from fastapi import Header, HTTPException, Request, status
from .config import settings

# Structured Audit Logger
logger = logging.getLogger("aegis.audit")
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('{"time": "%(asctime)s", "level": "%(levelname)s", "event": %(message)s}'))
if not logger.handlers:
    logger.addHandler(handler)


def log_audit_event(action: str, resource_type: str, resource_id: Optional[str] = None, details: Optional[dict] = None):
    """Record an immutable, structured audit entry for security compliance."""
    event = {
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    logger.info(json.dumps(event))


async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Validates tenant API Key when in production mode.
    Permits development bypass when APP_ENV is development.
    """
    if settings.app_env == "production":
        expected_key = settings.app_secret_key
        if not x_api_key or x_api_key != expected_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing API credential",
            )
    return x_api_key
