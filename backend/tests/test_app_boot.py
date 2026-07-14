"""Uygulamanın gerçekten başlayabildiğini doğrulayan smoke testler.

Bu dosya bilinçli olarak hiçbir şeyi mock'lamaz: amaç, servis katmanındaki
fonksiyonları değil, gerçek `app.main` import zincirini ve gerçek FastAPI
uygulamasını (TestClient ile) sınamaktır. Diğer test dosyalarının tamamı
servisleri/bağımlılıkları izole ettiği için, "uygulama hiç ayağa kalkmıyor"
sınıfındaki hatalar (örn. kırık bir import) sadece burada yakalanır.
"""

from fastapi.testclient import TestClient


def test_app_main_imports_without_error() -> None:
    """`uvicorn app.main:app`'in de yapacağı şeyin aynısı: modülü import et."""
    import app.main

    assert app.main.app is not None


def test_health_endpoint_returns_ok() -> None:
    """/health, DB'ye dokunmadan process'in ayakta olduğunu doğrular."""
    from app.main import app

    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
