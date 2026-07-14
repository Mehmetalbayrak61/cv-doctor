"""faz8 security hardening: normalize emails, password changed at

Revision ID: 207be07574fb
Revises: 7e1880b30417
Create Date: 2026-07-13 21:37:47.464324

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '207be07574fb'
down_revision: Union[str, Sequence[str], None] = '7e1880b30417'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "users", sa.Column("password_changed_at", sa.DateTime(timezone=True), nullable=True)
    )

    bind = op.get_bind()
    # E-postaları normalize etmeden (trim + lowercase) önce, normalizasyon
    # sonrası çakışacak satır var mı kontrol et. Varsa migration'ı burada
    # güvenlik için durduruyoruz — hangi hesabın "asıl" olduğuna sessizce karar
    # verip veri kaybetmek yerine, operatörün bu hesapları elle incelemesi
    # gerekir (bkz. güvenlik denetimi: case-varyantlı e-postalarla AI kotası
    # çoğaltma riski).
    collisions = bind.execute(
        sa.text(
            "SELECT lower(trim(email)) AS normalized, count(*) AS cnt "
            "FROM users GROUP BY lower(trim(email)) HAVING count(*) > 1"
        )
    ).fetchall()
    if collisions:
        normalized_list = ", ".join(row.normalized for row in collisions)
        raise RuntimeError(
            "Email normalizasyon migration'ı durduruldu: normalize edildiğinde "
            f"çakışacak birden fazla hesap bulundu ({normalized_list}). Bu "
            "hesapları migration'ı tekrar çalıştırmadan önce elle birleştirin "
            "veya yeniden adlandırın."
        )

    bind.execute(
        sa.text("UPDATE users SET email = lower(trim(email)) WHERE email <> lower(trim(email))")
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "password_changed_at")
    # E-posta normalizasyonu geri alınmaz: orijinal büyük/küçük harf ve
    # boşluk bilgisi upgrade sırasında kalıcı olarak kaybedilir (kasıtlı).
