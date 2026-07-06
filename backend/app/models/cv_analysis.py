import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.cv_document import CVDocument


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class CVAnalysis(TimestampMixin, Base):
    """Bir CV dosyası için AI analiz kaydı.

    Faz 4'te OpenAI entegrasyonu bu tabloyu dolduracak (ATS skoru, öneriler,
    eksik kelimeler vb.). Faz 2'de sadece tablo/ilişki hazırlığı yapılır.
    """

    __tablename__ = "cv_analyses"
    __table_args__ = (
        UniqueConstraint("cv_document_id", "version", name="uq_cv_analyses_document_version"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cv_document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_documents.id", ondelete="CASCADE"), index=True, nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # Aynı CV birden fazla kez analiz edilebilir; her analiz yeni bir versiyon olarak saklanır,
    # önceki sonuçlar (ve varsa hata kayıtları) korunur.
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[AnalysisStatus] = mapped_column(
        Enum(AnalysisStatus, name="analysis_status"), default=AnalysisStatus.PENDING, nullable=False
    )
    result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    cv_document: Mapped["CVDocument"] = relationship(back_populates="analyses")
