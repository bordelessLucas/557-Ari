from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    firebase_project_id: str = "ari-b0f40"
    google_application_credentials: str | None = None
    firebase_service_account_json: str | None = None
    cors_origins: str = (
        "http://localhost:5173,http://localhost:5174,"
        "http://127.0.0.1:5173,http://127.0.0.1:5174"
    )
    collect_max_items_per_source: int = 30
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    # openai | passthrough — sem chave, usa passthrough automaticamente
    ai_mode: str = "auto"
    ai_max_batch: int = 10
    ai_prompt_version: str = "editorial_v1"
    internal_api_secret: str | None = None

    @property
    def effective_ai_mode(self) -> str:
        mode = (self.ai_mode or "auto").strip().lower()
        if mode == "passthrough":
            return "passthrough"
        if mode == "openai":
            return "openai"
        # auto
        return "openai" if self.openai_api_key else "passthrough"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
