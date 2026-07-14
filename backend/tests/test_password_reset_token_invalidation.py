"""Guvenlik denetimi bulgusu: sifre sifirlama, sizmis olabilecek eski access
token'lari GECERSIZ kilmiyordu -- JWT'ler stateless oldugu icin sifre
degistirilse bile eski bir token, suresi dolana kadar (24 saat) calismaya
devam ediyordu.

Duzeltme: her token'a bir `iat` (issued at) claim'i eklenir; sifre
sifirlandiginda `User.password_changed_at` guncellenir; get_current_user,
token'in `iat`'i `password_changed_at`'ten ONCE ise reddeder. Session store
gerektirmeyen, stateless "logout all sessions".
"""

import uuid
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.dependencies import get_current_user
from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token, decode_access_token
from app.services.auth_service import AuthService


def test_create_access_token_embeds_issued_at() -> None:
    before = datetime.now(UTC)
    token = create_access_token(uuid.uuid4())
    after = datetime.now(UTC)

    decoded = decode_access_token(token)
    assert decoded is not None
    _, issued_at = decoded
    assert before - timedelta(seconds=2) <= issued_at <= after + timedelta(seconds=2)


async def test_get_current_user_rejects_token_issued_before_password_change(monkeypatch) -> None:
    user_id = uuid.uuid4()
    token = create_access_token(user_id)
    decoded = decode_access_token(token)
    assert decoded is not None
    _, issued_at = decoded

    fake_user = SimpleNamespace(
        id=user_id, is_active=True, password_changed_at=issued_at + timedelta(seconds=1)
    )
    monkeypatch.setattr(
        "app.core.dependencies.UserRepository",
        lambda db: SimpleNamespace(get_by_id=AsyncMock(return_value=fake_user)),
    )

    with pytest.raises(UnauthorizedError):
        await get_current_user(db=SimpleNamespace(), token=token)  # type: ignore[arg-type]


async def test_get_current_user_accepts_token_issued_after_password_change(monkeypatch) -> None:
    """Kullanici sifreyi sifirladiktan SONRA yeniden giris yapip yeni bir token
    alirsa, o yeni token calismaya devam etmeli."""
    user_id = uuid.uuid4()
    token = create_access_token(user_id)
    decoded = decode_access_token(token)
    assert decoded is not None
    _, issued_at = decoded

    fake_user = SimpleNamespace(
        id=user_id, is_active=True, password_changed_at=issued_at - timedelta(days=1)
    )
    monkeypatch.setattr(
        "app.core.dependencies.UserRepository",
        lambda db: SimpleNamespace(get_by_id=AsyncMock(return_value=fake_user)),
    )

    result = await get_current_user(db=SimpleNamespace(), token=token)  # type: ignore[arg-type]
    assert result is fake_user


async def test_get_current_user_accepts_token_when_password_never_changed(monkeypatch) -> None:
    """password_changed_at=None (hic sifirlanmamis kullanici) -- mevcut
    davranis bozulmamali, token normal sekilde kabul edilir."""
    user_id = uuid.uuid4()
    token = create_access_token(user_id)
    fake_user = SimpleNamespace(id=user_id, is_active=True, password_changed_at=None)
    monkeypatch.setattr(
        "app.core.dependencies.UserRepository",
        lambda db: SimpleNamespace(get_by_id=AsyncMock(return_value=fake_user)),
    )

    result = await get_current_user(db=SimpleNamespace(), token=token)  # type: ignore[arg-type]
    assert result is fake_user


async def test_reset_password_sets_password_changed_at() -> None:
    user = SimpleNamespace(id=uuid.uuid4(), hashed_password="old-hash", password_changed_at=None)
    token_record = SimpleNamespace(user_id=user.id)
    service = AuthService.__new__(AuthService)
    service._db = SimpleNamespace(commit=AsyncMock())
    service._repo = SimpleNamespace(get_by_id=AsyncMock(return_value=user))
    service._token_repo = SimpleNamespace(
        get_valid_by_hash=AsyncMock(return_value=token_record),
        mark_used=AsyncMock(),
    )

    before = datetime.now(UTC)
    await service.reset_password(raw_token="whatever", new_password="new-secure-password")
    after = datetime.now(UTC)

    assert user.hashed_password != "old-hash"
    assert user.password_changed_at is not None
    assert before - timedelta(seconds=2) <= user.password_changed_at <= after + timedelta(seconds=2)
    service._db.commit.assert_awaited_once()
