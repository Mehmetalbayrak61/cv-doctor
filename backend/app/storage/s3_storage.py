"""S3 API uyumlu depolama adaptörü.

AWS S3, Cloudflare R2 ve Supabase Storage hepsi S3 protokolüyle konuşur; aralarındaki
tek fark `S3_ENDPOINT_URL` — bu yüzden tek bir implementasyon üçünü de kapsar.
`LocalStorage` ile aynı relative-path/uuid-filename konvansiyonunu kullanır, böylece
servis katmanı hangi backend'in aktif olduğunu hiç bilmez.
"""

import uuid
from pathlib import Path

from app.core.config import settings
from app.storage.base import StorageBackend


class S3CompatibleStorage(StorageBackend):
    def __init__(self) -> None:
        self._bucket = settings.S3_BUCKET

    def _client(self):
        import aioboto3

        session = aioboto3.Session()
        return session.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL or None,
            region_name=settings.S3_REGION,
            aws_access_key_id=settings.S3_ACCESS_KEY_ID,
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
        )

    async def save(self, *, content: bytes, filename: str, subdir: str) -> str:
        extension = Path(filename).suffix
        stored_filename = f"{uuid.uuid4().hex}{extension}"
        relative_path = f"{subdir}/{stored_filename}"

        async with self._client() as client:
            await client.put_object(Bucket=self._bucket, Key=relative_path, Body=content)
        return relative_path

    async def delete(self, relative_path: str) -> None:
        async with self._client() as client:
            await client.delete_object(Bucket=self._bucket, Key=relative_path)

    async def read(self, relative_path: str) -> bytes:
        from botocore.exceptions import ClientError

        async with self._client() as client:
            try:
                response = await client.get_object(Bucket=self._bucket, Key=relative_path)
            except ClientError as exc:
                error_code = exc.response.get("Error", {}).get("Code")
                if error_code in ("NoSuchKey", "404"):
                    raise FileNotFoundError(relative_path) from exc
                raise
            async with response["Body"] as stream:
                return await stream.read()
