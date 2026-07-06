import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.cv_document import CVDocument


class AIOutputType(str, enum.Enum):
    SUMMARY_REWRITE = "summary_rewrite"
    EXPERIENCE_REWRITE = "experience_rewrite"
    SKILLS_REWRITE = "skills_rewrite"
    ATS_OPTIMIZATION = "ats_optimization"
    COVER_LETTER = "cover_letter"
    LINKEDIN_SUMMARY = "linkedin_summary"
    # Faz 6 - iş ilanına bağlı (job_description_id dolu) çıktılar
    ATS_KEYWORD_INSERTION = "ats_keyword_insertion"
    INTERVIEW_PREP = "interview_prep"
    SALARY_ESTIMATION = "salary_estimation"


class AIOutput(TimestampMixin, Base):
    """AI ile üretilen yeniden yazım/öneri çıktıları (Faz 5).

    Kullanıcı geçmişte ürettiği çıktıları tekrar görebilsin diye her üretim
    yeni bir satır olarak saklanır (analiz sürümlemesine benzer, ama üzerine
    yazma/versiyon numarası yok — sadece kronolojik geçmiş).
    """

    __tablename__ = "ai_outputs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cv_document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_documents.id", ondelete="CASCADE"), index=True, nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # Faz 6: iş ilanına bağlı çıktılar için dolu (ör. mülakat hazırlığı, maaş tahmini).
    job_description_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_descriptions.id", ondelete="CASCADE"), index=True, nullable=True
    )

    output_type: Mapped[AIOutputType] = mapped_column(
        Enum(AIOutputType, name="ai_output_type"), index=True, nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # Cover letter için { "job_title", "company_name", "job_description" } gibi ek girdi bağlamı.
    input_context: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    cv_document: Mapped["CVDocument"] = relationship(back_populates="ai_outputs")
