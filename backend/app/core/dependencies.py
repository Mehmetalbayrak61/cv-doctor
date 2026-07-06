"""FastAPI dependency'leri: DB session ve mevcut kullanıcı çözümlemesi."""

from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DbSession,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    user_id = decode_access_token(token)
    if user_id is None:
        raise UnauthorizedError("Geçersiz veya süresi dolmuş token.")

    user = await UserRepository(db).get_by_id(user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError("Kullanıcı bulunamadı veya pasif.")

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_verified_user(current_user: CurrentUser) -> User:
    """AI/maliyetli özellikler için: e-posta doğrulanmamışsa erişimi keser (Faz 7)."""
    if not current_user.is_email_verified:
        raise ForbiddenError(
            "Bu özelliği kullanmak için e-posta adresinizi doğrulamanız gerekiyor."
        )
    return current_user


VerifiedUser = Annotated[User, Depends(get_verified_user)]


async def get_admin_user(current_user: CurrentUser) -> User:
    if not current_user.is_admin:
        raise ForbiddenError("Bu işlem için yönetici yetkisi gerekiyor.")
    return current_user


AdminUser = Annotated[User, Depends(get_admin_user)]
