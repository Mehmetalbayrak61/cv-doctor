"""CV analiz skorlarını sabit ve açıklanabilir bir rubrikle hesaplar."""

import re
from dataclasses import dataclass

from app.schemas.cv_analysis import CVAnalysisResult, ScoreCriterion

SCORING_METHOD = "cv-readiness-v1"


@dataclass(frozen=True)
class _CriterionResult:
    key: str
    label: str
    score: int
    weight: int
    findings: list[str]

    def to_schema(self) -> ScoreCriterion:
        return ScoreCriterion(
            key=self.key,
            label=self.label,
            score=self.score,
            weight=self.weight,
            findings=self.findings,
        )


_SECTION_PATTERNS: dict[str, tuple[str, ...]] = {
    "profile": ("profil", "özet", "summary", "objective", "hakkımda"),
    "experience": ("deneyim", "iş deneyimi", "experience", "employment", "work history"),
    "education": ("eğitim", "education", "academic"),
    "skills": ("yetenek", "beceri", "skills", "competencies", "teknolojiler"),
}
_DATE_RE = re.compile(
    r"\b(?:19|20)\d{2}\b|\b(?:0?[1-9]|1[0-2])[./-](?:19|20)?\d{2}\b|"
    r"\b(?:oca|şub|mar|nis|may|haz|tem|ağu|eyl|eki|kas|ara)[a-zçğıöşü]*\s+(?:19|20)\d{2}\b",
    re.IGNORECASE,
)
_PHONE_RE = re.compile(r"(?:\+?90\s*)?(?:\(?0?5\d{2}\)?[\s.-]*)\d{3}[\s.-]*\d{2}[\s.-]*\d{2}")
_EMAIL_RE = re.compile(r"\b[^\s@]+@[^\s@]+\.[^\s@]+\b")
_URL_RE = re.compile(r"(?:https?://|linkedin\.com|github\.com)", re.IGNORECASE)
_NUMBER_RE = re.compile(
    r"(?:%\s*\d+|\d+\s*%|\b\d+[.,]?\d*\s*(?:₺|tl|usd|eur|kişi|proje|müşteri)\b)", re.IGNORECASE
)


def _clamp(value: float) -> int:
    return max(0, min(100, round(value)))


def _weighted_score(criteria: list[_CriterionResult]) -> int:
    total_weight = sum(item.weight for item in criteria)
    if total_weight == 0:
        return 0
    return _clamp(sum(item.score * item.weight for item in criteria) / total_weight)


_TURKISH_UPPER_TO_LOWER = str.maketrans({"İ": "i", "I": "ı"})
_PLURAL_SUFFIXES = ("ler", "lar")


def _turkish_casefold(text: str) -> str:
    """Python'ın `str.casefold()`'u Türkçe noktalı büyük `İ`'yi `i` + görünmez bir
    birleşik nokta işaretine (U+0307) genişletir. Bu işaret harf sınıfımızın
    (`[a-zçğıöşü]`) dışında kaldığından, sonraki regex temizliği kelime ortasına
    hayalet bir boşluk sokar — örn. "İŞ DENEYİMİ" -> "i ş deneyi mi" olur ve hiçbir
    başlık kalıbıyla eşleşmez. Bunun yerine Türkçe büyük/küçük harf eşlemesini
    (İ->i, I->ı) elle uygulayıp ardından sıradan `str.lower()` çağırıyoruz; diğer
    Türkçe harfler (Ç/Ğ/Ö/Ş/Ü) zaten `str.lower()` ile sorunsuz eşlenir."""
    return text.translate(_TURKISH_UPPER_TO_LOWER).lower()


def _term_matches_line(normalized: str, term: str) -> bool:
    """`term`'ü ya birebir ya da (başka bir başlık kelimesiyle devam eden) bir önek
    olarak, ya da yaygın Türkçe çoğul ekleriyle (-ler/-lar) eşleştirir — böylece
    "YETENEKLER"/"BECERİLER"/"DENEYİMLER" gibi tek kelimelik çoğul başlıklar da
    "yetenek"/"beceri"/"deneyim" terimleriyle eşleşir."""
    candidates = (term, *(f"{term}{suffix}" for suffix in _PLURAL_SUFFIXES))
    return any(
        normalized == candidate or normalized.startswith(f"{candidate} ")
        for candidate in candidates
    )


def _has_section_heading(text: str, terms: tuple[str, ...]) -> bool:
    for line in text.splitlines():
        normalized = re.sub(r"[^a-zçğıöşü ]", " ", _turkish_casefold(line))
        normalized = " ".join(normalized.split())
        if len(normalized) > 60:
            continue
        if any(_term_matches_line(normalized, term) for term in terms):
            return True
    return False


def _structure_criterion(text: str) -> _CriterionResult:
    found = [key for key, terms in _SECTION_PATTERNS.items() if _has_section_heading(text, terms)]
    score = len(found) * 25
    missing_labels = {
        "profile": "Profil özeti",
        "experience": "Deneyim",
        "education": "Eğitim",
        "skills": "Yetenekler",
    }
    findings = [
        f"{missing_labels[key]} bölümü belirgin değil."
        for key in _SECTION_PATTERNS
        if key not in found
    ]
    if not findings:
        findings.append("Temel CV bölümleri belirgin şekilde bulunuyor.")
    return _CriterionResult("structure", "Bölüm yapısı", score, 25, findings)


def _contact_criterion(text: str) -> _CriterionResult:
    checks = [
        bool(_EMAIL_RE.search(text)),
        bool(_PHONE_RE.search(text)),
        bool(_URL_RE.search(text)),
    ]
    score = 45 * int(checks[0]) + 35 * int(checks[1]) + 20 * int(checks[2])
    findings: list[str] = []
    if not checks[0]:
        findings.append("E-posta adresi okunabilir biçimde bulunamadı.")
    if not checks[1]:
        findings.append("Telefon numarası okunabilir biçimde bulunamadı.")
    if not checks[2]:
        findings.append("LinkedIn, GitHub veya portföy bağlantısı bulunamadı.")
    if not findings:
        findings.append("Temel iletişim bilgileri okunabilir biçimde bulunuyor.")
    return _CriterionResult("contact", "İletişim bilgileri", score, 15, findings)


def _readability_criterion(text: str) -> _CriterionResult:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    words = text.split()
    avg_line_words = len(words) / max(1, len(lines))
    unusual_ratio = sum(
        1
        for char in text
        if not (char.isalnum() or char.isspace() or char in ".,;:!?%/()[]{}+-_'@#&")
    ) / max(1, len(text))
    score = 100
    findings: list[str] = []
    if len(words) < 120:
        score -= 30
        findings.append("CV içeriği çok kısa; temel deneyim ayrıntıları eksik olabilir.")
    elif len(words) > 1800:
        score -= 20
        findings.append("CV içeriği oldukça uzun; taranabilirlik azalabilir.")
    if avg_line_words > 35:
        score -= 25
        findings.append("Metin blokları uzun; kısa ve taranabilir maddeler tercih edilmeli.")
    if unusual_ratio > 0.02:
        score -= 20
        findings.append(
            "Standart dışı karakter yoğunluğu makine tarafından okunabilirliği etkileyebilir."
        )
    if not findings:
        findings.append("Metin uzunluğu ve satır yapısı taranabilir görünüyor.")
    return _CriterionResult("readability", "Okunabilirlik", _clamp(score), 20, findings)


def _dates_criterion(text: str) -> _CriterionResult:
    dates = _DATE_RE.findall(text)
    if len(dates) >= 4:
        score, finding = 100, "Deneyim ve eğitim zaman çizelgesi okunabilir görünüyor."
    elif len(dates) >= 2:
        score, finding = 70, "Tarih bilgileri var ancak bazı dönemler belirsiz olabilir."
    elif dates:
        score, finding = 40, "Yalnızca bir tarih bilgisi bulundu; deneyim dönemlerini netleştirin."
    else:
        score, finding = 10, "Deneyim veya eğitim tarihleri okunabilir biçimde bulunamadı."
    return _CriterionResult("dates", "Tarih ve zaman çizelgesi", score, 15, [finding])


def _evidence_criterion(text: str) -> _CriterionResult:
    evidence_count = len(_NUMBER_RE.findall(text))
    score = _clamp(20 + min(evidence_count, 5) * 16)
    finding = (
        f"Ölçülebilir etki gösteren {evidence_count} ifade bulundu."
        if evidence_count
        else "Deneyim maddelerinde ölçülebilir sonuç bulunamadı."
    )
    return _CriterionResult("evidence", "Ölçülebilir etki", score, 15, [finding])


def _skills_criterion(text: str) -> _CriterionResult:
    has_section = _has_section_heading(text, _SECTION_PATTERNS["skills"])
    comma_separated_lines = sum(1 for line in text.splitlines() if line.count(",") >= 2)
    score = 80 if has_section else 35
    if has_section and comma_separated_lines:
        score = 100
    finding = (
        "Yetenekler ayrı ve taranabilir bir bölümde sunuluyor."
        if has_section
        else "Belirgin bir yetenekler bölümü bulunamadı."
    )
    return _CriterionResult("skills", "Yeteneklerin sunumu", score, 10, [finding])


def apply_scoring_rubric(cv_text: str, result: CVAnalysisResult) -> CVAnalysisResult:
    """AI alt değerlendirmelerini sabit rubrikle birleştirip toplam skorları hesaplar."""

    ats_criteria = [
        _structure_criterion(cv_text),
        _contact_criterion(cv_text),
        _readability_criterion(cv_text),
        _dates_criterion(cv_text),
        _evidence_criterion(cv_text),
        _skills_criterion(cv_text),
    ]
    overall_criteria = [
        _CriterionResult(
            "language",
            "Dil kalitesi",
            result.language_quality.score,
            20,
            [result.language_quality.comment],
        ),
        _CriterionResult(
            "sections",
            "Bölüm kalitesi",
            result.section_quality.score,
            15,
            [result.section_quality.comment],
        ),
        _CriterionResult(
            "experience",
            "Deneyim anlatımı",
            result.experience_quality.score,
            30,
            [result.experience_quality.comment],
        ),
        _CriterionResult(
            "education",
            "Eğitim sunumu",
            result.education_quality.score,
            10,
            [result.education_quality.comment],
        ),
        _CriterionResult(
            "skills_quality",
            "Yetenek kalitesi",
            result.skills_quality.score,
            25,
            [result.skills_quality.comment],
        ),
    ]
    return result.model_copy(
        update={
            "ats_score": _weighted_score(ats_criteria),
            "overall_score": _weighted_score(overall_criteria),
            "scoring_method": SCORING_METHOD,
            "ats_breakdown": [item.to_schema() for item in ats_criteria],
            "overall_breakdown": [item.to_schema() for item in overall_criteria],
            "missing_keywords": [],
        }
    )
