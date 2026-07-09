"""FastAPI uygulama giriş noktası."""

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.dependencies import DbSession
from app.core.error_handlers import register_exception_handlers
from app.core.security_headers import register_security_headers

# SENTRY_DSN boşsa hiç başlatılmaz — sentry_sdk import edilir ama init() çağrılmaz,
# bu yüzden DSN yokluğunda uygulama davranışı tamamen etkilenmeden çalışır.
if settings.SENTRY_DSN:
    import sentry_sdk

    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.1,
    )

app = FastAPI(title=settings.PROJECT_NAME)

register_exception_handlers(app)
register_security_headers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    # Auth Bearer JWT ile yapılır (cookie değil), bu yüzden credentials paylaşımına gerek yok.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Yalnızca process'in ayakta olduğunu doğrular — DB'ye hiç dokunmaz. Gerçek
    bağımlılık kontrolü için bkz. /ready."""
    return {"status": "ok"}


@app.get("/ready", tags=["health"])
async def readiness_check(db: DbSession, response: Response) -> dict[str, str]:
    """DB bağlantısını gerçekten test eder — uptime izleme bu endpoint'i kullanmalı."""
    try:
        await db.execute(select(1))
    except Exception:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "unavailable"}
    return {"status": "ok"}
