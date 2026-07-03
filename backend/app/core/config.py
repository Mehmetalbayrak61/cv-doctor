"""Uygulama genelinde kullanılan ayarlar. Değerler ortam değişkenlerinden (.env) okunur."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Genel
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "CV Doktoru API"
    API_V1_PREFIX: str = "/api/v1"

    # Veritabanı
    DATABASE_URL: str = "postgresql+asyncpg://cvdoktor:cvdoktor@localhost:5432/cvdoktor"

    # Auth / JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Frontend (Playwright'in /print route'unu açması için)
    FRONTEND_URL: str = "http://localhost:5173"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Yerel dosya deposu
    STORAGE_DIR: str = "storage_data"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
