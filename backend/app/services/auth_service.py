import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ConflictError, UnauthorizedError, UnprocessableEntityError
from app.core.security import hash_password, verify_password
from app.email.base import EmailSendError
from app.email.factory import get_email_sender
from app.email.templates import (
    build_account_deleted_email,
    build_password_reset_email,
    build_verification_email,
)
from app.models.user import User
from app.models.user_token import UserTokenType
from app.repositories.cv_document_repository import CVDocumentRepository
from app.repositories.user_repository import UserRepository
from app.repositories.user_token_repository import UserTokenRepository
from app.storage.factory import get_storage_backend

logger = logging.getLogger("app.auth")

_VERIFICATION_TOKEN_TTL = timedelta(hours=24)
_RESET_TOKEN_TTL = timedelta(hours=1)
_RESEND_COOLDOWN = timedelta(seconds=60)


def _generate_token() -> tuple[str, str]:
    """(ham_token, sha256_hash) döner. Ham değer e-postayla gönderilir, sadece hash saklanır."""
    raw = secrets.token_urlsafe(32)
    return raw, hashlib.sha256(raw.encode("utf-8")).hexdigest()


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = UserRepository(db)
        self._token_repo = UserTokenRepository(db)
        self._cv_repo = CVDocumentRepository(db)
        self._storage = get_storage_backend()
        self._email_sender = get_email_sender()

    async def register(self, *, email: str, password: str, first_name: str, last_name: str) -> User:
        existing = await self._repo.get_by_email(email)
        if existing is not None:
            raise ConflictError("Bu e-posta adresi zaten kayıtlı.")

        user = await self._repo.create(
            email=email,
            hashed_password=hash_password(password),
            first_name=first_name,
            last_name=last_name,
        )
        await self._issue_and_send_token(user, UserTokenType.EMAIL_VERIFICATION)
        await self._db.commit()
        return user

    async def authenticate(self, *, email: str, password: str) -> User:
        user = await self._repo.get_by_email(email)
        # Var olmayan e-posta ile yanlış şifre aynı mesajı döner
        # (kullanıcı numarasını sızdırmamak için)
        if user is None or not verify_password(password, user.hashed_password):
            raise UnauthorizedError("E-posta veya şifre hatalı.")
        if not user.is_active:
            raise UnauthorizedError("Hesap pasif durumda.")
        return user

    async def verify_email(self, *, raw_token: str) -> User:
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        token = await self._token_repo.get_valid_by_hash(
            token_hash=token_hash, token_type=UserTokenType.EMAIL_VERIFICATION
        )
        if token is None:
            raise UnprocessableEntityError("Doğrulama bağlantısı geçersiz veya süresi dolmuş.")

        user = await self._repo.get_by_id(token.user_id)
        if user is None:
            raise UnprocessableEntityError("Doğrulama bağlantısı geçersiz veya süresi dolmuş.")

        user.is_email_verified = True
        await self._token_repo.mark_used(token)
        await self._db.commit()
        return user

    async def resend_verification(self, *, user: User) -> None:
        if user.is_email_verified:
            raise ConflictError("E-posta adresiniz zaten doğrulanmış.")

        latest = await self._token_repo.get_latest_by_user(
            user_id=user.id, token_type=UserTokenType.EMAIL_VERIFICATION
        )
        if latest is not None and datetime.now(UTC) - latest.created_at < _RESEND_COOLDOWN:
            raise UnprocessableEntityError(
                "Kısa süre önce bir doğrulama e-postası gönderildi. Lütfen biraz bekleyin."
            )

        await self._issue_and_send_token(user, UserTokenType.EMAIL_VERIFICATION)
        await self._db.commit()

    async def request_password_reset(self, *, email: str) -> None:
        user = await self._repo.get_by_email(email)
        if user is None:
            # Kullanıcı numarasını sızdırmamak için sessizce çık — çağıran her zaman 200 döner.
            return

        await self._issue_and_send_token(user, UserTokenType.PASSWORD_RESET)
        await self._db.commit()

    async def reset_password(self, *, raw_token: str, new_password: str) -> None:
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        token = await self._token_repo.get_valid_by_hash(
            token_hash=token_hash, token_type=UserTokenType.PASSWORD_RESET
        )
        if token is None:
            raise UnprocessableEntityError("Sıfırlama bağlantısı geçersiz veya süresi dolmuş.")

        user = await self._repo.get_by_id(token.user_id)
        if user is None:
            raise UnprocessableEntityError("Sıfırlama bağlantısı geçersiz veya süresi dolmuş.")

        user.hashed_password = hash_password(new_password)
        await self._token_repo.mark_used(token)
        await self._db.commit()

    async def delete_account(self, *, user: User, password: str) -> None:
        if not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Şifre hatalı.")

        # Onay e-postası için silinmeden önce yakalanır.
        email, first_name, user_id = user.email, user.first_name, user.id

        # DB'deki her şey (cv_documents, cv_analyses, job_descriptions, job_matches,
        # ai_outputs, ai_usage_logs, subscriptions, user_tokens) users.id üzerinde
        # ondelete="CASCADE" ile tanımlı — tek `db.delete(user)` hepsini temizler.
        # Fiziksel CV dosyaları DB cascade'in kapsamı dışında, bu yüzden ayrıca silinir.
        documents = await self._cv_repo.list_by_user(user.id)
        for document in documents:
            try:
                await self._storage.delete(document.file_path)
            except Exception:
                logger.warning(
                    "Hesap silme: CV dosyası silinemedi user_id=%s file_path=%s",
                    user.id,
                    document.file_path,
                )

        await self._db.delete(user)
        await self._db.commit()

        subject, html_body, text_body = build_account_deleted_email(first_name=first_name)
        try:
            await self._email_sender.send(
                to=email, subject=subject, html_body=html_body, text_body=text_body
            )
        except EmailSendError:
            logger.warning("Hesap silme onay e-postası gönderilemedi: user_id=%s", user_id)

    async def _issue_and_send_token(self, user: User, token_type: UserTokenType) -> None:
        raw_token, token_hash = _generate_token()
        is_verification = token_type == UserTokenType.EMAIL_VERIFICATION
        ttl = _VERIFICATION_TOKEN_TTL if is_verification else _RESET_TOKEN_TTL
        await self._token_repo.create(
            user_id=user.id,
            token_type=token_type,
            token_hash=token_hash,
            expires_at=datetime.now(UTC) + ttl,
        )

        if token_type == UserTokenType.EMAIL_VERIFICATION:
            url = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"
            subject, html_body, text_body = build_verification_email(
                first_name=user.first_name, verification_url=url
            )
        else:
            url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
            subject, html_body, text_body = build_password_reset_email(
                first_name=user.first_name, reset_url=url
            )

        try:
            await self._email_sender.send(
                to=user.email, subject=subject, html_body=html_body, text_body=text_body
            )
        except EmailSendError:
            # E-posta gönderimi başarısız olsa bile kayıt/talep işlemini geri almıyoruz —
            # kullanıcı "tekrar gönder" ile yeniden deneyebilir.
            logger.warning("E-posta gönderilemedi: user_id=%s type=%s", user.id, token_type.value)
