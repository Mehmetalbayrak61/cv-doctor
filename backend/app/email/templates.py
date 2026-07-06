"""Basit, inline-stil HTML e-posta şablonları (Türkçe)."""

_WRAPPER = """\
<div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 480px; \
margin: 0 auto; padding: 32px 24px; color: #0b0b0b;">
  <p style="font-size: 18px; font-weight: 600; margin-bottom: 24px;">CV Doktoru</p>
  {body}
  <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">
    Bu bağlantıyı siz istemediyseniz bu e-postayı yok sayabilirsiniz.
  </p>
</div>
"""


def build_verification_email(*, first_name: str, verification_url: str) -> tuple[str, str, str]:
    """(subject, html_body, text_body) döner."""
    subject = "E-posta adresinizi doğrulayın"
    body = f"""\
  <p>Merhaba {first_name},</p>
  <p>CV Doktoru hesabınızı aktifleştirmek için e-posta adresinizi doğrulayın:</p>
  <p style="margin: 24px 0;">
    <a href="{verification_url}"
       style="background:#1f5f5b;color:#fff;padding:10px 20px;border-radius:8px;
              text-decoration:none;font-weight:600;">E-postamı Doğrula</a>
  </p>
  <p>Bu bağlantı 24 saat geçerlidir.</p>
"""
    html = _WRAPPER.format(body=body)
    text = (
        f"Merhaba {first_name},\n\nE-posta adresinizi doğrulamak için şu bağlantıyı açın:\n"
        f"{verification_url}\n\nBu bağlantı 24 saat geçerlidir."
    )
    return subject, html, text


def build_account_deleted_email(*, first_name: str) -> tuple[str, str, str]:
    """(subject, html_body, text_body) döner.

    Not: `_WRAPPER`'ın "bu bağlantıyı siz istemediyseniz yok sayın" dipnotu burada
    anlamsız (silme zaten geri alınamaz ve tıklanacak bir bağlantı yok) — bu yüzden
    kendi dipnotuyla, `_WRAPPER` kullanmadan ayrı yazıldı.
    """
    subject = "CV Doktoru hesabınız silindi"
    body = f"""\
<div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 480px; \
margin: 0 auto; padding: 32px 24px; color: #0b0b0b;">
  <p style="font-size: 18px; font-weight: 600; margin-bottom: 24px;">CV Doktoru</p>
  <p>Merhaba {first_name},</p>
  <p>CV Doktoru hesabınız ve hesabınıza bağlı tüm veriler (yüklenen CV'ler, analizler,
  iş ilanı eşleştirmeleri ve AI çıktıları) kalıcı olarak silindi.</p>
  <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">
    Bu işlemi siz yapmadıysanız lütfen destek@cvdoktoru.app adresinden bizimle iletişime
    geçin.
  </p>
</div>
"""
    text = (
        f"Merhaba {first_name},\n\nCV Doktoru hesabınız ve hesabınıza bağlı tüm veriler "
        "kalıcı olarak silindi.\n\nBu işlemi siz yapmadıysanız lütfen destek@cvdoktoru.app "
        "adresinden bizimle iletişime geçin."
    )
    return subject, body, text


def build_password_reset_email(*, first_name: str, reset_url: str) -> tuple[str, str, str]:
    subject = "Şifre sıfırlama talebi"
    body = f"""\
  <p>Merhaba {first_name},</p>
  <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
  <p style="margin: 24px 0;">
    <a href="{reset_url}"
       style="background:#1f5f5b;color:#fff;padding:10px 20px;border-radius:8px;
              text-decoration:none;font-weight:600;">Şifremi Sıfırla</a>
  </p>
  <p>Bu bağlantı 1 saat geçerlidir.</p>
"""
    html = _WRAPPER.format(body=body)
    text = (
        f"Merhaba {first_name},\n\nŞifrenizi sıfırlamak için şu bağlantıyı açın:\n"
        f"{reset_url}\n\nBu bağlantı 1 saat geçerlidir."
    )
    return subject, html, text
