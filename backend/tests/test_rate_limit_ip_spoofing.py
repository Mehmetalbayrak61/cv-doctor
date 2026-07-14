"""Güvenlik denetimi bulgusu: `_client_ip()` X-Forwarded-For'un İLK değerine
güveniyordu — bu, istemci tarafından serbestçe uydurulabilir, dolayısıyla auth
rate limiter (login/register/reset-password brute-force koruması) her istekte
farklı bir sahte header göndererek tamamen atlatılabiliyordu.

Düzeltme: varsayılan olarak (TRUSTED_PROXY_COUNT=0) X-Forwarded-For'a HİÇ
güvenilmez, her zaman ham TCP bağlantısının IP'si kullanılır. Yalnızca
uygulamanın önünde N güvenilir proxy hop'u olduğu açıkça yapılandırılırsa,
header'ın SONUNDAN o kadar hop'a güvenilir (güvenilir proxy'nin bizzat
eklediği değer) — öncesi her zaman potansiyel olarak sahte kabul edilir.
"""

from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.core.rate_limit_ip import _attempts, _client_ip
from app.main import app


def _request(*, client_host: str | None, forwarded: str | None) -> SimpleNamespace:
    headers = {"x-forwarded-for": forwarded} if forwarded else {}
    client = SimpleNamespace(host=client_host) if client_host else None
    return SimpleNamespace(client=client, headers=headers)


def test_default_config_never_trusts_forwarded_header() -> None:
    """TRUSTED_PROXY_COUNT=0 (varsayılan): X-Forwarded-For var olsa bile yok
    sayılır, her zaman ham bağlantı IP'si kullanılır."""
    request = _request(client_host="203.0.113.9", forwarded="1.2.3.4, 5.6.7.8")
    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 0):
        assert _client_ip(request) == "203.0.113.9"  # type: ignore[arg-type]


def test_no_forwarded_header_uses_direct_ip_regardless_of_trust_setting() -> None:
    request = _request(client_host="203.0.113.9", forwarded=None)
    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 1):
        assert _client_ip(request) == "203.0.113.9"  # type: ignore[arg-type]


def test_trusted_single_hop_uses_last_entry_not_first() -> None:
    """TRUSTED_PROXY_COUNT=1 (Railway/Render/Fly.io/tek Nginx senaryosu): sondan
    1 hop'a güvenilir — bu, güvenilir proxy'nin bizzat eklediği değerdir.
    Başındaki değerler saldırgan tarafından uydurulmuş olabilir, kullanılmaz."""
    # "1.2.3.4" saldırganın kendi header'ına eklediği sahte değer,
    # "198.51.100.7" ise güvenilir proxy'nin gerçek bağlantıdan görüp eklediği değer.
    request = _request(client_host="internal-proxy-ip", forwarded="1.2.3.4, 198.51.100.7")
    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 1):
        assert _client_ip(request) == "198.51.100.7"  # type: ignore[arg-type]


def test_spoofed_forwarded_header_cannot_impersonate_a_different_client() -> None:
    """Saldırgan her istekte farklı bir X-Forwarded-For göndererek "yeni bir
    istemciymiş" gibi görünmeye çalışsa bile (varsayılan config'de) IP hep aynı
    (ham bağlantı IP'si) kalır — rate limit bucket'ı bölünemez."""
    ips_seen = set()
    for fake_header in ["1.1.1.1", "2.2.2.2", "9.9.9.9, 8.8.8.8"]:
        request = _request(client_host="203.0.113.9", forwarded=fake_header)
        with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 0):
            ips_seen.add(_client_ip(request))  # type: ignore[arg-type]
    assert ips_seen == {"203.0.113.9"}


def test_fewer_hops_than_trusted_count_falls_back_to_direct_ip() -> None:
    """Yapılandırılan güvenilir hop sayısından daha az hop varsa (beklenmedik
    zincir kısalığı), sessizce yanlış bir değer almak yerine ham IP'ye düşülür."""
    request = _request(client_host="203.0.113.9", forwarded="1.2.3.4")
    with patch("app.core.rate_limit_ip.settings.TRUSTED_PROXY_COUNT", 3):
        assert _client_ip(request) == "203.0.113.9"  # type: ignore[arg-type]


def test_login_rate_limit_survives_forwarded_header_spoofing_over_real_http() -> None:
    """Entegrasyon testi: gerçek TestClient ile /auth/login'e, her istekte
    FARKLI bir sahte X-Forwarded-For header'ıyla, limitin üzerinde istek atılır.
    Spoofing çalışıyorsa hiçbir istek 429 almaz (her biri "yeni IP" sanılır).
    Düzeltme doğruysa TestClient'in sabit bağlantı IP'si kullanıldığından bir
    noktadan sonra 429 alınır."""
    _attempts.clear()
    client = TestClient(app, raise_server_exceptions=False)
    from app.core.config import settings

    threshold = settings.AUTH_RATE_LIMIT_PER_15_MIN
    statuses = []
    for i in range(threshold + 3):
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "nobody@example.com", "password": "wrong"},
            headers={"X-Forwarded-For": f"10.0.0.{i}"},  # her istekte farklı sahte IP
        )
        statuses.append(response.status_code)

    assert 429 in statuses, (
        "Spoofed X-Forwarded-For rate limiti atlatabiliyor olmalıydı ama "
        f"atlatamadı mı yoksa hiç 429 gelmedi mi kontrol et: {statuses}"
    )
    _attempts.clear()
