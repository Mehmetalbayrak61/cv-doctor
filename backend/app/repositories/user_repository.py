import unicodedata
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


def normalize_email(email: str) -> str:
    """Trim + lowercase + Unicode NFC normalizasyonu. Aynı adresin farklı
    yazımlarının (baştaki/sondaki boşluk, büyük/küçük harf, aynı karakterin
    farklı Unicode bileşimleri) veritabanında ayrı, "benzersiz" hesaplar olarak
    görünmesini engeller — aksi halde tek bir gerçek e-posta kutusu, ayrı ayrı
    doğrulanabilen ve her biri kendi AI kotasına sahip birden çok hesaba
    kaydolmak için kullanılabilir."""
    return unicodedata.normalize("NFC", email).strip().lower()


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return await self._db.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        result = await self._db.execute(select(User).where(User.email == normalize_email(email)))
        return result.scalar_one_or_none()

    async def create(self, *, email: str, hashed_password: str, first_name: str, last_name: str) -> User:
        user = User(
            email=normalize_email(email),
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name,
        )
        self._db.add(user)
        await self._db.flush()
        await self._db.refresh(user)
        return user
