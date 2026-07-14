"""Uygulama genelinde kullanılan ayarlar. Değerler ortam değişkenlerinden (.env) okunur."""

from functools import lru_cache
from typing import Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Genel
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    PROJECT_NAME: str = "CV Doktoru API"
    API_V1_PREFIX: str = "/api/v1"

    # Veritabanı
    DATABASE_URL: str = "postgresql+asyncpg://cvdoktor:cvdoktor@localhost:5432/cvdoktor"

    # Auth / JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    # Faz 7: refresh-token rotasyonu henüz uygulanmadığı için ömür kasıtlı olarak
    # uzun tutulur (bilinen sınırlama — bkz. SECURITY_CHECKLIST.md).
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Frontend (doğrulama/şifre sıfırlama linkleri ve Playwright'in /print route'u için)
    FRONTEND_URL: str = "http://localhost:5173"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Dosya deposu: "local" (varsayılan, dev) veya "s3" (S3/R2/Supabase Storage — hepsi
    # S3 API uyumlu olduğu için tek implementasyon yeterli, bkz. app/storage/s3_storage.py)
    STORAGE_BACKEND: Literal["local", "s3"] = "local"
    STORAGE_DIR: str = "storage_data"
    S3_BUCKET: str = ""
    # Gerçek AWS S3 için boş bırakın; Cloudflare R2 / Supabase Storage için kendi
    # endpoint'lerini yazın (bkz. .env.example).
    S3_ENDPOINT_URL: str = ""
    S3_REGION: str = "auto"
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""

    # E-posta: EMAIL_PROVIDER="brevo_api" ise Brevo'nun HTTPS REST API'si kullanılır
    # (Railway giden SMTP portlarını — 25/465/587/2525 — engellediği için tercih
    # edilir). Boşsa ve SMTP_HOST doluysa gerçek SMTP kullanılır; ikisi de boşsa
    # ConsoleEmailSender (dev) devreye girer.
    EMAIL_PROVIDER: str = ""
    BREVO_API_KEY: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    EMAIL_FROM_ADDRESS: str = "no-reply@cvdoktoru.app"
    EMAIL_FROM_NAME: str = "CV Doktoru"

    # CV dosya yükleme kısıtları
    MAX_CV_UPLOAD_SIZE_MB: int = 10
    # Modern modellerin bağlam sınırının altında, fakat normal bir CV'nin çok üzerinde.
    # Sınır aşılırsa sessiz kırpma yerine kullanıcıya açık hata döndürülür.
    MAX_CV_TEXT_CHARS: int = 100_000
    ALLOWED_CV_CONTENT_TYPES: list[str] = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    ALLOWED_CV_EXTENSIONS: list[str] = [".pdf", ".docx"]

    # AI rewrite endpointleri için kullanıcı başına saatlik üretim limiti (Faz 5)
    AI_RATE_LIMIT_PER_HOUR: int = 20

    # Faz 7: auth endpointleri için IP başına 15 dakikalık deneme limiti
    AUTH_RATE_LIMIT_PER_15_MIN: int = 10
    # X-Forwarded-For'da güvenilir (uygulamanın önündeki gerçek proxy'nin eklediği)
    # hop sayısı. 0 (varsayılan) = X-Forwarded-For'a HİÇ güvenilmez, her zaman ham
    # soket bağlantısının IP'si kullanılır — bu, header spoofing'e karşı güvenli
    # varsayılandır. Railway/Render/Fly.io gibi PaaS'lerde veya tek katmanlı bir
    # Nginx/Caddy reverse proxy arkasında deploy edilirken 1'e ayarlanmalı: bu
    # durumda güvenilir proxy, gerçek istemci IP'sini her zaman header'ın EN SONUNA
    # ekler, bu yüzden yalnızca sondan bu kadar hop'a güvenilir — öncesindeki
    # değerler istemci tarafından uydurulmuş olabilir ve asla kullanılmaz.
    TRUSTED_PROXY_COUNT: int = 0

    # Boşsa Sentry hiç başlatılmaz (bkz. main.py) — hata izleme opsiyonel.
    SENTRY_DSN: str = ""

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def _normalize_database_url(cls, value: str) -> str:
        """Railway/Render gibi managed Postgres sağlayıcıları bağlantı string'ini
        genelde `postgres://` veya düz `postgresql://` şemasıyla verir; asyncpg
        sürücüsü için `postgresql+asyncpg://` gerekir."""
        if value.startswith("postgres://"):
            return "postgresql+asyncpg://" + value[len("postgres://") :]
        if value.startswith("postgresql://"):
            return "postgresql+asyncpg://" + value[len("postgresql://") :]
        return value

    @property
    def max_cv_upload_size_bytes(self) -> int:
        return self.MAX_CV_UPLOAD_SIZE_MB * 1024 * 1024

    @model_validator(mode="after")
    def _validate_production_config(self) -> "Settings":
        """Prod'da güvensiz/eksik konfigürasyonla sessizce ayağa kalkmak yerine hemen patlar."""
        if self.ENVIRONMENT != "production":
            return self

        problems: list[str] = []
        if self.SECRET_KEY == "change-me-in-production":
            problems.append("SECRET_KEY hâlâ varsayılan değerde")
        if not self.OPENAI_API_KEY:
            problems.append("OPENAI_API_KEY tanımlı değil")

        if self.EMAIL_PROVIDER == "brevo_api":
            if not self.BREVO_API_KEY:
                problems.append("EMAIL_PROVIDER=brevo_api ama BREVO_API_KEY tanımlı değil")
            if not self.EMAIL_FROM_ADDRESS:
                problems.append("EMAIL_PROVIDER=brevo_api ama EMAIL_FROM_ADDRESS tanımlı değil")
        elif not self.SMTP_HOST:
            problems.append("SMTP_HOST tanımlı değil (e-posta gönderilemez)")

        if self.STORAGE_BACKEND == "s3" and not self.S3_BUCKET:
            problems.append("STORAGE_BACKEND=s3 ama S3_BUCKET tanımlı değil")

        if problems:
            raise ValueError(
                "ENVIRONMENT=production için güvenli olmayan yapılandırma: " + "; ".join(problems)
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
