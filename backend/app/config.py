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
    cors_origins: str = "http://localhost:5173,http://localhost:5174"
    collect_max_items_per_source: int = 30
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    ai_max_batch: int = 10
    ai_prompt_version: str = "editorial_v1"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
