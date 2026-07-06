import uuid
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.ai_output import AIOutput
    from app.models.cv_analysis import CVAnalysis
    from app.models.job_match import JobMatch
    from app.models.user import User


class CVDocument(TimestampMixin, Base):
    """Kullanıcının yüklediği ham CV dosyası (PDF/DOCX)."""

    __tablename__ = "cv_documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(150), nullable=False)

    user: Mapped["User"] = relationship(back_populates="cv_documents")
    analyses: Mapped[list["CVAnalysis"]] = relationship(
        back_populates="cv_document", cascade="all, delete-orphan"
    )
    ai_outputs: Mapped[list["AIOutput"]] = relationship(
        back_populates="cv_document", cascade="all, delete-orphan"
    )
    job_matches: Mapped[list["JobMatch"]] = relationship(
        back_populates="cv_document", cascade="all, delete-orphan"
    )
