import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class AIUsageFeature(str, enum.Enum):
    CV_ANALYSIS = "cv_analysis"
    REWRITE = "rewrite"
    JOB_MATCH = "job_match"


class AIUsageLog(TimestampMixin, Base):
    """Her gerçek OpenAI çağrısı için token/maliyet kaydı (Faz 7).

    Mock provider (API key yokken) hiçbir zaman burada loglanmaz — admin
    metrikleri sadece gerçek harcamayı yansıtsın diye.
    """

    __tablename__ = "ai_usage_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    feature: Mapped[AIUsageFeature] = mapped_column(
        Enum(AIUsageFeature, name="ai_usage_feature"), index=True, nullable=False
    )
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    completion_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    total_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    # Yaklaşık maliyet (USD); statik fiyat tablosuyla hesaplanır (bkz. app/ai/pricing.py).
    estimated_cost_usd: Mapped[float] = mapped_column(Numeric(10, 6), nullable=False)

    user: Mapped["User"] = relationship(back_populates="ai_usage_logs")
