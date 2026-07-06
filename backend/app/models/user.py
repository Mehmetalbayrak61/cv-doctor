import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.ai_usage_log import AIUsageLog
    from app.models.cv_document import CVDocument
    from app.models.job_description import JobDescription
    from app.models.subscription import Subscription
    from app.models.user_token import UserToken


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # Faz 7: e-posta doğrulanana kadar AI/maliyetli özellikler kilitli (bkz. VerifiedUser).
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    cv_documents: Mapped[list["CVDocument"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    job_descriptions: Mapped[list["JobDescription"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    subscription: Mapped["Subscription | None"] = relationship(back_populates="user", cascade="all, delete-orphan")
    tokens: Mapped[list["UserToken"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    ai_usage_logs: Mapped[list["AIUsageLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
