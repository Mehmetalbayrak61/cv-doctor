from functools import lru_cache

from app.core.config import settings
from app.storage.base import StorageBackend


@lru_cache
def get_storage_backend() -> StorageBackend:
    if settings.STORAGE_BACKEND == "s3":
        from app.storage.s3_storage import S3CompatibleStorage

        return S3CompatibleStorage()

    from app.storage.local_storage import LocalStorage

    return LocalStorage()
