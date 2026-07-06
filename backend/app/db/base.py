"""SQLAlchemy declarative base. Tüm modeller bu sınıftan türetilir."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Alembic autogenerate'in tüm tabloları görebilmesi için modeller burada,
# Base tanımlandıktan sonra import edilir (döngüsel import'u önler).
import app.models  # noqa: E402,F401
