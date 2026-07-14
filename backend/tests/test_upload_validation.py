from app.core.config import settings
from app.utils.file_validation import (
    has_allowed_content_type,
    has_allowed_extension,
    matches_magic_bytes,
    resolve_content_type,
)


def test_pdf_upload_validation() -> None:
    content_type = resolve_content_type("cv.pdf", "application/octet-stream")
    assert has_allowed_extension("cv.pdf", settings.ALLOWED_CV_EXTENSIONS)
    assert has_allowed_content_type(content_type, settings.ALLOWED_CV_CONTENT_TYPES)
    assert matches_magic_bytes(b"%PDF-1.7 content", content_type)


def test_docx_upload_validation_and_legacy_doc_rejection() -> None:
    content_type = resolve_content_type("cv.docx", None)
    assert has_allowed_extension("cv.docx", settings.ALLOWED_CV_EXTENSIONS)
    assert matches_magic_bytes(b"PK\x03\x04 archive", content_type)
    assert not has_allowed_extension("cv.doc", settings.ALLOWED_CV_EXTENSIONS)


def test_spoofed_upload_is_rejected() -> None:
    assert not matches_magic_bytes(b"not a pdf", "application/pdf")
