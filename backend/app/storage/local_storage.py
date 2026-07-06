"""Yerel dosya sistemi tabanlı depolama adaptörü (ilk sürüm için)."""

import uuid
from pathlib import Path

import anyio

from app.core.config import settings
from app.storage.base import StorageBackend


class LocalStorage(StorageBackend):
    def __init__(self, base_dir: str | None = None) -> None:
        self._base_dir = Path(base_dir or settings.STORAGE_DIR)

    async def save(self, *, content: bytes, filename: str, subdir: str) -> str:
        target_dir = self._base_dir / subdir
        await anyio.Path(target_dir).mkdir(parents=True, exist_ok=True)

        extension = Path(filename).suffix
        stored_filename = f"{uuid.uuid4().hex}{extension}"
        relative_path = f"{subdir}/{stored_filename}"

        await anyio.Path(self._base_dir / relative_path).write_bytes(content)
        return relative_path

    async def delete(self, relative_path: str) -> None:
        path = anyio.Path(self._base_dir / relative_path)
        if await path.exists():
            await path.unlink()

    async def read(self, relative_path: str) -> bytes:
        path = anyio.Path(self._base_dir / relative_path)
        if not await path.exists():
            raise FileNotFoundError(relative_path)
        return await path.read_bytes()
