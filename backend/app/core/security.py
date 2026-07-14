"""Parola hashleme ve JWT access token üretimi/doğrulaması."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(subject: uuid.UUID) -> str:
    now = datetime.now(UTC)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {"sub": str(subject), "exp": expire, "iat": now, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> tuple[uuid.UUID, datetime] | None:
    """Token'ı doğrular; geçerliyse (kullanıcı id, token'ın üretildiği an) döner,
    aksi halde None. `issued_at`, get_current_user'da `password_changed_at` ile
    karşılaştırılıp şifre değişikliğinden ÖNCE üretilmiş token'ları geçersiz
    kılmak için kullanılır — session store gerektirmeyen "logout all sessions"."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None

    if payload.get("type") != "access":
        return None

    subject = payload.get("sub")
    issued_at_ts = payload.get("iat")
    if subject is None or issued_at_ts is None:
        return None

    try:
        user_id = uuid.UUID(subject)
    except ValueError:
        return None

    return user_id, datetime.fromtimestamp(issued_at_ts, tz=UTC)
