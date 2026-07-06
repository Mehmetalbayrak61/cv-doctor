"""IP bazlı, process-içi (in-memory) rate limiter — auth endpointleri için.

Tek-instance VPS deploy'u için yeterlidir. Birden fazla worker/instance'a
geçilirse (yatay ölçekleme) bu, paylaşılan bir store'a (ör. Redis) taşınmalıdır
— bkz. SECURITY_CHECKLIST.md.
"""

import time
from collections import defaultdict

from fastapi import Request

from app.core.config import settings
from app.core.exceptions import RateLimitError

_WINDOW_SECONDS = 15 * 60
_attempts: dict[str, list[float]] = defaultdict(list)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def enforce_auth_rate_limit(request: Request) -> None:
    ip = _client_ip(request)
    now = time.monotonic()
    window_start = now - _WINDOW_SECONDS

    recent = [t for t in _attempts[ip] if t > window_start]
    if len(recent) >= settings.AUTH_RATE_LIMIT_PER_15_MIN:
        _attempts[ip] = recent
        raise RateLimitError("Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.")

    recent.append(now)
    _attempts[ip] = recent
