"""Guvenlik denetimi bulgusu: `User.email` buyuk/kucuk harfe duyarli karsilastiriliyordu
(`User.email == email`), bu yuzden tek bir gercek mailbox (`user@x.com`, `User@x.com`,
`USER@X.COM`...) farkli, birbirinden bagimsiz "benzersiz" hesaplar olarak kayit
olabiliyor ve her biri kendi 20/saat AI kotasini aliyordu -- kotayi carpan bir acik.
"""

import unicodedata

from app.repositories.user_repository import normalize_email


def test_trims_leading_and_trailing_whitespace() -> None:
    assert normalize_email("  user@example.com  ") == "user@example.com"


def test_lowercases() -> None:
    assert normalize_email("User@Example.COM") == "user@example.com"


def test_combines_trim_and_lowercase() -> None:
    assert normalize_email("  USER@Example.Com  ") == "user@example.com"


def test_unicode_nfc_normalization_collapses_equivalent_forms() -> None:
    """Bir aksanli harf, tek bir kod noktasi (NFC, on-bilesik) olarak da, temel
    harf + ayri birlesik aksan isareti (NFD, ayrik-bilesik) olarak da yazilabilir
    -- gorsel olarak ayni, byte-byte farkli. NFC normalizasyonu olmadan bu iki
    yazim farkli hesaplar olarak kaydolabilirdi."""
    precomposed = unicodedata.normalize("NFC", "josé@example.com")  # é = tek kod noktasi
    decomposed = unicodedata.normalize("NFD", precomposed)  # e + U+0301 (birlesik aksan)
    assert precomposed != decomposed, "test fixture'i gercekten farkli byte dizileri olmali"
    assert normalize_email(precomposed) == normalize_email(decomposed)


def test_case_variants_all_normalize_to_the_same_address() -> None:
    """Denetim raporundaki tam senaryo: tek bir mailbox'in farkli yazimlari."""
    variants = ["user@x.com", "User@x.com", "USER@X.COM", "  User@X.Com  "]
    normalized = {normalize_email(v) for v in variants}
    assert normalized == {"user@x.com"}


def test_does_not_alter_an_already_normalized_email() -> None:
    assert normalize_email("user@example.com") == "user@example.com"
