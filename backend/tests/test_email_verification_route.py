"""E-posta doğrulama guard'ının gerçek HTTP route'una bağlı olduğunu doğrular.

test_email_verification.py, get_verified_user() fonksiyonunu izole çağırır — bu,
fonksiyonun kendisinin doğru olduğunu kanıtlar ama HİÇBİR endpoint'e bağlı
olduğunu KANITLAMAZ. Bu dosya gerçek FastAPI uygulamasını TestClient ile
çağırır; bir geliştirici ileride bir AI endpoint'inde `VerifiedUser`'ı
`CurrentUser`'a çevirse (guard'ı kaldırsa), bu test kırılır — diğer dosyadaki
testler kırılmaz.
"""

import uuid
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.core.dependencies import get_current_user
from app.main import app


def _override_current_user(*, is_email_verified: bool) -> None:
    fake_user = SimpleNamespace(
        id=uuid.uuid4(),
        is_email_verified=is_email_verified,
        is_active=True,
        is_admin=False,
    )
    app.dependency_overrides[get_current_user] = lambda: fake_user


def test_unverified_user_gets_403_from_real_analyze_endpoint() -> None:
    """VerifiedUser guard'lı /cvs/{cv_id}/analyze route'unun gerçekten guard'a
    bağlı olduğunu, HTTP seviyesinde ve DB'ye hiç dokunmadan doğrular (guard,
    servise/DB'ye ulaşmadan ForbiddenError fırlatır)."""
    _override_current_user(is_email_verified=False)
    try:
        client = TestClient(app)
        response = client.post(f"/api/v1/cvs/{uuid.uuid4()}/analyze")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403


def test_verified_user_is_not_blocked_by_the_verification_guard() -> None:
    """Doğrulanmış kullanıcı guard'da durmamalı — 403 DEĞİL, daha ileride (DB'ye
    gerçekten dokunan) farklı bir hata almalı. Bu, guard'ın sadece unverified'ı
    değil, herkesi bloke eden bir regresyonu da yakalar.

    `raise_server_exceptions=False`: bu ortamda gerçek bir Postgres çalışmadığı
    için guard'ı geçtikten sonra DB bağlantısı başarısız olur (beklenen) — bunu
    bir Python exception'ı olarak değil, 500 response'u olarak almak istiyoruz ki
    "guard'ı geçti mi" sorusunu DB'nin ayakta olup olmamasından bağımsız
    yanıtlayabilelim."""
    _override_current_user(is_email_verified=True)
    try:
        client = TestClient(app, raise_server_exceptions=False)
        response = client.post(f"/api/v1/cvs/{uuid.uuid4()}/analyze")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code not in (401, 403)
