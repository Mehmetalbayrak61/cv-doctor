import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_token import UserToken, UserTokenType


class UserTokenRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        token_type: UserTokenType,
        token_hash: str,
        expires_at: datetime,
    ) -> UserToken:
        token = UserToken(
            user_id=user_id, token_type=token_type, token_hash=token_hash, expires_at=expires_at
        )
        self._db.add(token)
        await self._db.flush()
        await self._db.refresh(token)
        return token

    async def get_valid_by_hash(
        self, *, token_hash: str, token_type: UserTokenType
    ) -> UserToken | None:
        result = await self._db.execute(
            select(UserToken).where(
                UserToken.token_hash == token_hash,
                UserToken.token_type == token_type,
                UserToken.used_at.is_(None),
                UserToken.expires_at > datetime.now(UTC),
            )
        )
        return result.scalar_one_or_none()

    async def get_latest_by_user(
        self, *, user_id: uuid.UUID, token_type: UserTokenType
    ) -> UserToken | None:
        result = await self._db.execute(
            select(UserToken)
            .where(UserToken.user_id == user_id, UserToken.token_type == token_type)
            .order_by(UserToken.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def mark_used(self, token: UserToken) -> None:
        token.used_at = datetime.now(UTC)
        await self._db.flush()
