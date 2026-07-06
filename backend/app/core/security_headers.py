"""Tarayıcı tabanlı temel güvenlik header'ları.

HSTS sadece production'da eklenir — HTTPS'in reverse proxy (Caddy) tarafından
sağlandığı varsayılır; dev/staging'de zorlanırsa yerel http erişimini bozar.
"""

from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, Response

from app.core.config import settings


async def security_headers_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


def register_security_headers(app: FastAPI) -> None:
    app.middleware("http")(security_headers_middleware)
