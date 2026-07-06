"""FastAPI uygulama giriş noktası."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.error_handlers import register_exception_handlers
from app.core.security_headers import register_security_headers

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
    """Servisin ayakta olduğunu doğrulamak için basit health-check endpoint'i."""
    return {"status": "ok"}
