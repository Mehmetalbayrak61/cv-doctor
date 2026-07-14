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
    """Gerçek istemci IP'sini döndürür.

    Railway'de ham TCP bağlantısının IP'si (`request.client.host`) İSTEMCİYE AİT
    DEĞİL — Railway'in edge proxy'si ile container arasındaki dahili, dönen bir
    NAT/routing havuzundan gelir (canlıda doğrulandı: `100.64.0.0/10` aralığında,
    aynı gerçek istemcinin art arda istekleri bile FARKLI adres gösteriyor, ve bu
    havuz TÜM istemciler arasında paylaşılıyor — yani ham IP'yi anahtar olarak
    kullanmak farklı kullanıcıları aynı rate-limit kovasında birleştirip
    birbirini yanlışlıkla bloke edebiliyor).

    `X-Forwarded-For` de güvenilir değil: canlıda doğrulandı ki Railway'in edge'i
    bu header'ı `<gerçek istemci IP>, <Railway'in kendi dahili hop'u>` şeklinde
    KENDİSİ oluşturuyor (istemcinin gönderdiği değeri tamamen yok sayıyor) — fakat
    ikinci (son) hop da dahili havuzdan geldiği için dönüyor; sabit sayıda hop
    "sondan güven" modeli bu yüzden yanlış sonuç veriyordu (bkz. git geçmişi).

    Bunun yerine Railway'in `X-Real-Ip` header'ı kullanılır: canlıda doğrulandı ki
    bu header (a) her zaman tek, gerçek istemci IP'sine eşit değer taşıyor, (b)
    istemci tarafından ayarlanan değer Railway edge'i tarafından tamamen yok
    sayılıp gerçek değerle değiştiriliyor (spoofing denendi, etkisiz), (c) art
    arda isteklerde STABİL kalıyor. `settings.TRUSTED_PROXY_COUNT` (0/1) sadece bu
    header'ın okunup okunmayacağını (yani uygulamanın Railway gibi bilinen bir
    reverse proxy'nin arkasında çalıştığını) açık şekilde işaretlemek için
    kullanılır; header yoksa (örn. yerel geliştirme) ham bağlantı IP'sine düşülür.
    """
    direct_ip = request.client.host if request.client else "unknown"
    if settings.TRUSTED_PROXY_COUNT <= 0:
        return direct_ip

    real_ip = request.headers.get("x-real-ip")
    if real_ip and real_ip.strip():
        return real_ip.strip()
    return direct_ip


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
