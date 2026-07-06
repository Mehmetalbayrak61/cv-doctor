"""Dosya depolama için soyut arayüz.

Bugün yerel dosya sistemi kullanılıyor (`LocalStorage`); ileride S3/Cloud Storage'a
geçilirse sadece bu arayüzü uygulayan yeni bir sınıf eklenir, servis katmanı
değişmeden kalır.
"""

from abc import ABC, abstractmethod


class StorageBackend(ABC):
    @abstractmethod
    async def save(self, *, content: bytes, filename: str, subdir: str) -> str:
        """İçeriği kaydeder ve depolama içindeki göreli yolu döner."""

    @abstractmethod
    async def delete(self, relative_path: str) -> None:
        """Verilen göreli yoldaki dosyayı siler (yoksa sessizce geçer)."""

    @abstractmethod
    async def read(self, relative_path: str) -> bytes:
        """Verilen göreli yoldaki dosyanın içeriğini okur. Yoksa FileNotFoundError fırlatır."""
