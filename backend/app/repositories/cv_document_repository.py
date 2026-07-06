import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cv_document import CVDocument


class CVDocumentRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self, *, user_id: uuid.UUID, file_name: str, file_path: str, file_size: int, mime_type: str
    ) -> CVDocument:
        document = CVDocument(
            user_id=user_id, file_name=file_name, file_path=file_path, file_size=file_size, mime_type=mime_type
        )
        self._db.add(document)
        await self._db.flush()
        await self._db.refresh(document)
        return document

    async def list_by_user(self, user_id: uuid.UUID) -> list[CVDocument]:
        result = await self._db.execute(
            select(CVDocument).where(CVDocument.user_id == user_id).order_by(CVDocument.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, document_id: uuid.UUID) -> CVDocument | None:
        return await self._db.get(CVDocument, document_id)

    async def delete(self, document: CVDocument) -> None:
        await self._db.delete(document)
        await self._db.flush()
