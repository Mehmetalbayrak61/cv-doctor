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
    """Ham TCP bağlantısının IP'sini döndürür — X-Forwarded-For istemci tarafından
    serbestçe uydurulabildiği için varsayılan olarak HİÇ okunmaz (bkz.
    settings.TRUSTED_PROXY_COUNT). Yalnızca bu uygulamanın önünde bilinen sayıda
    güvenilir proxy hop'u olduğu açıkça yapılandırılmışsa, header'ın SONUNDAN o
    kadar hop'a — yani güvenilir proxy'nin bizzat eklediği değere — güvenilir;
    öncesindeki her şey sahte olabilir ve asla kullanılmaz."""
    direct_ip = request.client.host if request.client else "unknown"
    trusted_hops = settings.TRUSTED_PROXY_COUNT
    if trusted_hops <= 0:
        return direct_ip

    forwarded = request.headers.get("x-forwarded-for")
    if not forwarded:
        return direct_ip

    hops = [hop.strip() for hop in forwarded.split(",") if hop.strip()]
    if len(hops) < trusted_hops:
        # Beklenenden az hop var — güvenilir proxy zincirinin dışından gelmiş
        # olabilir, ham bağlantı IP'sine düş.
        return direct_ip
    return hops[-trusted_hops]


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
