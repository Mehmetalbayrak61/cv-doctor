import uuid

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import NotFoundError, PayloadTooLargeError, UnprocessableEntityError
from app.models.cv_document import CVDocument
from app.models.user import User
from app.repositories.cv_document_repository import CVDocumentRepository
from app.storage.factory import get_storage_backend
from app.utils.file_validation import (
    has_allowed_content_type,
    has_allowed_extension,
    matches_magic_bytes,
    resolve_content_type,
)

CV_STORAGE_SUBDIR = "cvs"


class CVService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = CVDocumentRepository(db)
        self._storage = get_storage_backend()

    async def upload(self, *, user: User, file: UploadFile) -> CVDocument:
        content, content_type = await self._read_and_validate(file)

        relative_path = await self._storage.save(
            content=content, filename=file.filename or "cv", subdir=CV_STORAGE_SUBDIR
        )

        document = await self._repo.create(
            user_id=user.id,
            file_name=file.filename or "cv",
            file_path=relative_path,
            file_size=len(content),
            mime_type=content_type or "application/octet-stream",
        )
        await self._db.commit()
        return document

    async def list_for_user(self, *, user: User) -> list[CVDocument]:
        return await self._repo.list_by_user(user.id)

    async def get_owned(self, *, user: User, document_id: uuid.UUID) -> CVDocument:
        document = await self._repo.get_by_id(document_id)
        if document is None or document.user_id != user.id:
            raise NotFoundError("CV bulunamadı.")
        return document

    async def delete(self, *, user: User, document_id: uuid.UUID) -> None:
        document = await self.get_owned(user=user, document_id=document_id)
        await self._storage.delete(document.file_path)
        await self._repo.delete(document)
        await self._db.commit()

    async def _read_and_validate(self, file: UploadFile) -> tuple[bytes, str | None]:
        content = await file.read()

        if len(content) > settings.max_cv_upload_size_bytes:
            raise PayloadTooLargeError(
                f"Dosya boyutu {settings.MAX_CV_UPLOAD_SIZE_MB}MB sınırını aşıyor."
            )

        if not file.filename or not has_allowed_extension(
            file.filename, settings.ALLOWED_CV_EXTENSIONS
        ):
            raise UnprocessableEntityError("Sadece PDF veya DOCX dosyaları yüklenebilir.")

        content_type = resolve_content_type(file.filename, file.content_type)
        if not has_allowed_content_type(content_type, settings.ALLOWED_CV_CONTENT_TYPES):
            raise UnprocessableEntityError("Desteklenmeyen dosya tipi.")

        if not matches_magic_bytes(content, content_type):
            raise UnprocessableEntityError("Dosya içeriği beyan edilen tip ile uyuşmuyor.")

        return content, content_type
