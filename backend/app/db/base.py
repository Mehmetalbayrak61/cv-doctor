"""SQLAlchemy declarative base. Tüm modeller bu sınıftan türetilir.

Alembic'in autogenerate özelliğinin tüm tabloları görebilmesi için,
Faz 2'de eklenecek her model modülü burada (dosyanın sonunda) import edilecek.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
