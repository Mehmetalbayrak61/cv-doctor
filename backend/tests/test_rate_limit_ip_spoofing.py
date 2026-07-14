"""Güvenlik geçmişi: `_client_ip()` önce X-Forwarded-For'un İLK değerine güveniyordu
(spoofable). Sonra "sondan N hop'a güven" modeline geçildi — ama bu, Railway
production'ında canlı doğrulamayla YANLIŞ çıktı: Railway'in edge'i XFF'i
`<gerçek istemci IP>, <Railway'in kendi dönen dahili hop'u>` şeklinde kendisi
kuruyor, yani "sondan 1 hop" aslında Railway'in kendi rotasyonlu iç adresini
alıyordu, gerçek istemciyi değil (rate limiter hiç tetiklenmiyordu).

TRUSTED_PROXY_COUNT=0'a (ham `request.client.host`) geri dönüldüğünde ise BAŞKA
bir gerçek production kesintisi yaşandı: Railway'de `request.client.host` da
istemciye ait değil — TÜM istemciler arasında paylaşılan, dönen küçük bir dahili
NAT havuzundan (`100.64.0.0/10`) geliyor. Bu, farklı gerçek kullanıcıların aynı
rate-limit kovasına düşüp birbirini yanlışlıkla bloke etmesine yol açtı.

Kesin düzeltme: Railway'in `X-Real-Ip` header'ı — canlı production'da doğrulandı
ki (a) her zaman tek, gerçek istemci IP'sine eşit değer taşıyor, (b) istemcinin
göndermeye çalıştığı herhangi bir değer Railway edge'i tarafından tamamen yok
sayılıp gerçek değerle değiştiriliyor, (c) art arda isteklerde stabil kalıyor.
"""

from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.core.rate_limit_ip import _attempts, _client_ip
from app.main import app


def _request(*, client_host: str | None, real_ip: str | None) -> SimpleNamespace:
    headers = {"x-real-ip": real_ip} if real_ip else {}
    client = SimpleNamespace(host=client_host) if client_host else None
    return SimpleNamespace(client=client, headers=headers)


def test_default_config_never_trusts_real_ip_header() -> None:
    """TRUSTED_PROXY_COUNT=0 (varsayılan): X-Real-Ip var olsa bile yok sayılır,
    her zaman ham bağlantı IP'si kullanılır."""
    request = _request(client_host="203.0.113.9", real_ip="1.2.3.4")
    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 0):
        assert _client_ip(request) == "203.0.113.9"  # type: ignore[arg-type]


def test_no_real_ip_header_uses_direct_ip_regardless_of_trust_setting() -> None:
    request = _request(client_host="203.0.113.9", real_ip=None)
    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 1):
        assert _client_ip(request) == "203.0.113.9"  # type: ignore[arg-type]


def test_trusted_mode_uses_real_ip_header_not_direct_socket_ip() -> None:
    """TRUSTED_PROXY_COUNT=1 (Railway production): `X-Real-Ip` kullanılır, ham
    soket IP'si (Railway'in paylaşılan dahili NAT havuzu) değil."""
    request = _request(client_host="100.64.0.7", real_ip="198.51.100.7")
    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 1):
        assert _client_ip(request) == "198.51.100.7"  # type: ignore[arg-type]


def test_direct_ip_alone_would_incorrectly_merge_different_real_clients() -> None:
    """Regresyon belgesi: canlıda yaşanan kesintinin mekanizması. Railway'in
    paylaşılan dahili NAT havuzunu simüle eder — TRUSTED_PROXY_COUNT=0 ile farklı
    GERÇEK istemcilerin istekleri bile aynı küçük IP havuzuna denk gelebilir
    (burada doğrudan aynı direct_ip'yi paylaştıklarını varsayıyoruz), bu da
    onları yanlışlıkla TEK rate-limit kovasında birleştirir. X-Real-Ip modu
    (TRUSTED_PROXY_COUNT=1) bu sorunu çözer çünkü her gerçek istemcinin kendi
    stabil değeri vardır."""
    shared_pool_ip = "100.64.0.5"
    client_a = _request(client_host=shared_pool_ip, real_ip="198.51.100.1")
    client_b = _request(client_host=shared_pool_ip, real_ip="198.51.100.2")

    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 0):
        # Yanlış davranış (artık production'da kullanılmıyor): iki farklı
        # istemci aynı anahtara düşer.
        assert _client_ip(client_a) == _client_ip(client_b) == shared_pool_ip  # type: ignore[arg-type]

    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 1):
        # Doğru davranış: X-Real-Ip ile ayrışırlar.
        assert _client_ip(client_a) != _client_ip(client_b)  # type: ignore[arg-type]


def test_spoofed_real_ip_has_no_effect_when_trust_disabled() -> None:
    """Varsayılan config'de (TRUSTED_PROXY_COUNT=0) saldırgan hangi X-Real-Ip
    değerini gönderirse göndersin sonuç değişmez — rate limit bucket'ı bölünemez."""
    ips_seen = set()
    for fake_header in ["1.1.1.1", "2.2.2.2", "9.9.9.9"]:
        request = _request(client_host="203.0.113.9", real_ip=fake_header)
        with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 0):
            ips_seen.add(_client_ip(request))  # type: ignore[arg-type]
    assert ips_seen == {"203.0.113.9"}


def test_login_rate_limit_accumulates_per_real_ip_over_real_http() -> None:
    """Entegrasyon testi: gerçek TestClient ile /auth/login'e sabit bir
    `X-Real-Ip` üzerinden limitin üzerinde istek atılır (TRUSTED_PROXY_COUNT=1
    varsayılarak) — aynı gerçek istemcinin tekrarlanan istekleri doğru şekilde
    TEK kovada birikip bir noktadan sonra 429 döndürmeli."""
    _attempts.clear()
    client = TestClient(app, raise_server_exceptions=False)
    from app.core.config import settings

    threshold = settings.AUTH_RATE_LIMIT_PER_15_MIN
    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 1):
        statuses = []
        for _ in range(threshold + 3):
            response = client.post(
                "/api/v1/auth/login",
                data={"username": "nobody@example.com", "password": "wrong"},
                headers={"X-Real-Ip": "198.51.100.42"},
            )
            statuses.append(response.status_code)

    assert 429 in statuses, f"Aynı X-Real-Ip'den gelen istekler 429 tetiklemeliydi: {statuses}"
    _attempts.clear()


def test_login_rate_limit_does_not_cross_contaminate_different_real_ips() -> None:
    """Farklı `X-Real-Ip` değerlerine sahip istekler birbirinin limitini
    tüketmemeli (bir kullanıcının denemeleri başka bir kullanıcıyı bloke etmez)."""
    _attempts.clear()
    client = TestClient(app, raise_server_exceptions=False)
    from app.core.config import settings

    threshold = settings.AUTH_RATE_LIMIT_PER_15_MIN
    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 1):
        for _ in range(threshold):
            client.post(
                "/api/v1/auth/login",
                data={"username": "nobody@example.com", "password": "wrong"},
                headers={"X-Real-Ip": "198.51.100.100"},
            )
        # Farklı gerçek istemci — kendi taze kovasında olmalı, hemen bloklanmamalı.
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "nobody@example.com", "password": "wrong"},
            headers={"X-Real-Ip": "198.51.100.200"},
        )
    assert response.status_code != 429
    _attempts.clear()
