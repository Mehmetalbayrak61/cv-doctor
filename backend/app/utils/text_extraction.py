"""CV dosyalarından (PDF/DOCX) düz metin çıkarma.

pypdf ve python-docx metni her zaman Unicode (str) olarak döndürür, bu yüzden
Türkçe karakterler (ç, ğ, ı, ö, ş, ü) için ekstra bir kodlama işlemi gerekmez;
kaynak dosya metni doğru gömdüğü sürece burada da doğru gelir.
"""

import io

from docx import Document
from pypdf import PdfReader
from pypdf.errors import PdfReadError

_PDF_MIME = "application/pdf"
_DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


class TextExtractionError(Exception):
    """CV içeriğinden metin çıkarılamadığında fırlatılır (bozuk/boş/desteklenmeyen dosya)."""


def extract_text(*, content: bytes, mime_type: str) -> str:
    """Dosya içeriğinden düz metni çıkarır. Metin boşsa veya dosya okunamıyorsa hata fırlatır."""
    if mime_type == _PDF_MIME:
        text = _extract_pdf_text(content)
    elif mime_type == _DOCX_MIME:
        text = _extract_docx_text(content)
    else:
        raise TextExtractionError(
            "Bu dosya formatından metin çıkarılamıyor. Lütfen PDF veya DOCX yükleyin."
        )

    text = text.strip()
    if not text:
        raise TextExtractionError("CV içeriği boş veya okunamadı.")
    return text


def _extract_pdf_text(content: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except PdfReadError as exc:
        raise TextExtractionError("PDF dosyası okunamadı veya bozuk.") from exc


def _extract_docx_text(content: bytes) -> str:
    try:
        document = Document(io.BytesIO(content))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    except Exception as exc:  # python-docx, geçersiz zip/xml için çeşitli istisnalar fırlatabilir
        raise TextExtractionError("DOCX dosyası okunamadı veya bozuk.") from exc
