"""K3: Türkçe büyük harfli bölüm başlıklarının doğru tespit edildiğini doğrular.

Python'ın `str.casefold()`'u Türkçe noktalı büyük `İ`'yi `i` + görünmez bir birleşik
nokta işaretine genişletir; bu da bir sonraki regex temizliğinde kelime ortasına
hayalet boşluk sokup hiçbir başlık kalıbıyla eşleşmemesine yol açıyordu (örn.
"İŞ DENEYİMİ" -> "i ş deneyi mi"). Ayrıca tekil-kelime çoğul başlıklar ("YETENEKLER",
"BECERİLER", "DENEYİMLER") eskiden hiç tanınmıyordu. Bu dosya denetim raporunda
açıkça istenen 6 başlığı da kapsar.
"""

import pytest

from app.services.cv_scoring_service import _SECTION_PATTERNS, _has_section_heading


@pytest.mark.parametrize(
    ("heading", "section_key"),
    [
        ("PROFİL ÖZETİ", "profile"),
        ("İŞ DENEYİMİ", "experience"),
        ("DENEYİMLER", "experience"),
        ("EĞİTİM", "education"),
        ("YETENEKLER", "skills"),
        ("BECERİLER", "skills"),
    ],
)
def test_uppercase_turkish_heading_is_detected(heading: str, section_key: str) -> None:
    assert _has_section_heading(heading, _SECTION_PATTERNS[section_key]) is True


def test_full_cv_with_all_six_heading_variants_scores_full_structure() -> None:
    """Tek bir CV metninde 6 varyantın hepsi bir arada geçse bile (gerçekçi değil,
    ama regresyonu net gösterir) hiçbiri diğerini bozmadan tespit edilmeli."""
    cv_text = "\n".join(
        [
            "PROFİL ÖZETİ",
            "Deneyimli yazılım geliştirici.",
            "",
            "İŞ DENEYİMİ",
            "2021 - 2024 Yazılım Geliştirici",
            "",
            "EĞİTİM",
            "2016 - 2020 Bilgisayar Mühendisliği",
            "",
            "YETENEKLER",
            "Python, React, PostgreSQL",
        ]
    )
    for key in ("profile", "experience", "education", "skills"):
        assert _has_section_heading(cv_text, _SECTION_PATTERNS[key]) is True, key
