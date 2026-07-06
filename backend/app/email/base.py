"""E-posta gönderimi için soyut arayüz.

`app/storage/base.py` ile aynı felsefe: bugün SMTP kullanılıyor; ileride başka bir
sağlayıcıya (ör. bir HTTP API) geçilirse sadece bu arayüzü uygulayan yeni bir sınıf
eklenir, servis katmanı (AuthService) değişmeden kalır.
"""

from abc import ABC, abstractmethod


class EmailSendError(Exception):
    """E-posta gönderimi başarısız olduğunda fırlatılır."""


class EmailSender(ABC):
    @abstractmethod
    async def send(self, *, to: str, subject: str, html_body: str, text_body: str) -> None:
        """Belirtilen adrese e-posta gönderir."""
