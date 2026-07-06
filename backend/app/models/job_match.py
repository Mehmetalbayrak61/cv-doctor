import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.cv_analysis import AnalysisStatus
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.cv_document import CVDocument
    from app.models.job_description import JobDescription


class JobMatch(TimestampMixin, Base):
    """Bir CV'nin bir iş ilanıyla AI karşılaştırma sonucu (Faz 6).

    Analiz durumu semantiği CVAnalysis ile aynı olduğu için aynı `AnalysisStatus`
    enum'ı yeniden kullanılır.
    """

    __tablename__ = "job_matches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    job_description_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_descriptions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    cv_document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_documents.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # create_type=False: bu enum tipi Postgres'te CVAnalysis tarafından zaten oluşturuldu;
    # aynı isimle tekrar CREATE TYPE denemesi hataya yol açar.
    status: Mapped[AnalysisStatus] = mapped_column(
        Enum(AnalysisStatus, name="analysis_status", create_type=False),
        default=AnalysisStatus.PENDING,
        nullable=False,
    )
    result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    job_description: Mapped["JobDescription"] = relationship(back_populates="matches")
    cv_document: Mapped["CVDocument"] = relationship(back_populates="job_matches")
