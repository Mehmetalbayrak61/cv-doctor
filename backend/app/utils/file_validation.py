"""CV dosya yüklemeleri için tip doğrulama.

İstemcinin gönderdiği Content-Type header'ına güvenilmez; dosyanın gerçek
başlangıç byte'ları (magic number) da kontrol edilir.
"""

from pathlib import Path

_MAGIC_BYTES: dict[str, tuple[bytes, ...]] = {
    "application/pdf": (b"%PDF",),
    # .docx (OOXML) bir zip arşividir
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (b"PK\x03\x04",),
}

_EXTENSION_CONTENT_TYPES: dict[str, str] = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

# Bazı HTTP istemcileri (ör. bazı mobil multipart kütüphaneleri) .docx için
# generic bir content-type gönderir; bu durumda dosya uzantısına güvenilir.
_GENERIC_CONTENT_TYPES = {None, "", "application/octet-stream"}


def has_allowed_extension(filename: str, allowed_extensions: list[str]) -> bool:
    return Path(filename).suffix.lower() in {ext.lower() for ext in allowed_extensions}


def resolve_content_type(filename: str, declared_content_type: str | None) -> str | None:
    """İstemci generic/boş bir content-type gönderdiyse dosya uzantısından beklenen tipi çıkarır."""
    if declared_content_type not in _GENERIC_CONTENT_TYPES:
        return declared_content_type
    return _EXTENSION_CONTENT_TYPES.get(Path(filename).suffix.lower())


def has_allowed_content_type(content_type: str | None, allowed_content_types: list[str]) -> bool:
    return content_type in allowed_content_types


def matches_magic_bytes(content: bytes, content_type: str | None) -> bool:
    """Dosya içeriğinin beyan edilen tipe ait bilinen bir imzayla başlayıp
    başlamadığını kontrol eder.
    """
    signatures = _MAGIC_BYTES.get(content_type or "")
    if signatures is None:
        return False
    return any(content.startswith(sig) for sig in signatures)
