import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.subscription import Subscription


class BillingPeriod(str, enum.Enum):
    FREE = "free"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class Plan(TimestampMixin, Base):
    """Abonelik paket kataloğu (Free/Pro/... ). Faz 2'de sadece veri modeli hazırlanır,
    ödeme entegrasyonu ve satış akışı ileriki bir fazda eklenecek."""

    __tablename__ = "plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    billing_period: Mapped[BillingPeriod] = mapped_column(
        Enum(BillingPeriod, name="billing_period"), default=BillingPeriod.FREE, nullable=False
    )
    price_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_cv_uploads: Mapped[int] = mapped_column(Integer, nullable=False)
    max_ai_requests_per_month: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    subscriptions: Mapped[list["Subscription"]] = relationship(back_populates="plan")
