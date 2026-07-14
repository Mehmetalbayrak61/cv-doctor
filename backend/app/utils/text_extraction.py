"""CV dosyalarından (PDF/DOCX) düz metin çıkarma.

pypdf ve python-docx metni her zaman Unicode (str) olarak döndürür, bu yüzden
Türkçe karakterler (ç, ğ, ı, ö, ş, ü) için ekstra bir kodlama işlemi gerekmez;
kaynak dosya metni doğru gömdüğü sürece burada da doğru gelir.
"""

import io
import zipfile

from docx import Document
from pypdf import PdfReader
from pypdf.errors import PdfReadError

_PDF_MIME = "application/pdf"
_DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

# DOCX bir zip arşividir; python-docx içeriği tam olarak açıp XML'i parse etmeden
# önce hiçbir boyut kontrolü yapmaz. Küçük ama yüksek sıkıştırma oranlı bir dosya
# (zip bomb), 100.000 karakter metin sınırı devreye girmeden önce yüzlerce
# megabayt bellek ve saniyeler süren CPU tüketebilir (gerçek bir PoC ile
# doğrulanmıştır: 628KB'lık bir dosya 240M karaktere/540MB+ belleğe genişledi).
# Bu yüzden zip'in KENDİ merkezi dizin metadata'sına (hiçbir şey açılmadan okunur)
# bakıp şüpheli dosyaları extraction'a hiç başlamadan reddediyoruz.
_MAX_DOCX_ZIP_ENTRIES = 200
_MAX_DOCX_SINGLE_ENTRY_UNCOMPRESSED_BYTES = 20 * 1024 * 1024  # 20 MB
_MAX_DOCX_TOTAL_UNCOMPRESSED_BYTES = 50 * 1024 * 1024  # 50 MB
_MAX_DOCX_COMPRESSION_RATIO = 100
_MAX_DOCX_DOCUMENT_XML_UNCOMPRESSED_BYTES = 5 * 1024 * 1024  # 5 MB (asıl metin burada)


class TextExtractionError(Exception):
    """CV içeriğinden metin çıkarılamadığında fırlatılır (bozuk/boş/desteklenmeyen dosya)."""


def _check_docx_zip_safety(content: bytes) -> None:
    """Şüpheli (zip bomb olabilecek) bir DOCX'i, içeriği hiç açmadan reddeder.
    Yalnızca zip merkezi dizinindeki metadata (dosya sayısı, sıkıştırılmış/
    sıkıştırılmamış boyutlar) okunur — hiçbir entry decompress edilmez."""
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            infos = archive.infolist()
    except zipfile.BadZipFile as exc:
        raise TextExtractionError("DOCX dosyası okunamadı veya bozuk.") from exc

    if len(infos) > _MAX_DOCX_ZIP_ENTRIES:
        raise TextExtractionError("DOCX dosyası beklenenden çok daha karmaşık, işlenemiyor.")

    total_uncompressed = 0
    for info in infos:
        if info.file_size > _MAX_DOCX_SINGLE_ENTRY_UNCOMPRESSED_BYTES:
            raise TextExtractionError("DOCX dosyası beklenenden çok daha büyük, işlenemiyor.")
        if (
            info.compress_size > 0
            and info.file_size / info.compress_size > _MAX_DOCX_COMPRESSION_RATIO
        ):
            raise TextExtractionError("DOCX dosyası güvenlik nedeniyle işlenemiyor.")
        if info.filename == "word/document.xml":
            if info.file_size > _MAX_DOCX_DOCUMENT_XML_UNCOMPRESSED_BYTES:
                raise TextExtractionError("DOCX dosyası beklenenden çok daha büyük, işlenemiyor.")
        total_uncompressed += info.file_size

    if total_uncompressed > _MAX_DOCX_TOTAL_UNCOMPRESSED_BYTES:
        raise TextExtractionError("DOCX dosyası beklenenden çok daha büyük, işlenemiyor.")


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
    _check_docx_zip_safety(content)
    try:
        document = Document(io.BytesIO(content))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    except Exception as exc:  # python-docx, geçersiz zip/xml için çeşitli istisnalar fırlatabilir
        raise TextExtractionError("DOCX dosyası okunamadı veya bozuk.") from exc
