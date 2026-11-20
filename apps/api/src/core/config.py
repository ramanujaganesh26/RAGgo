from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "AegisDoc Intelligence API"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api/v1"

    # Server binding
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS origins
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    # RAGFlow Foundational Engine
    ragflow_base_url: str = "http://localhost:9380/api/v1"
    ragflow_api_key: str = "dev_ragflow_api_key"
    ragflow_timeout_seconds: float = 30.0


settings = Settings()
