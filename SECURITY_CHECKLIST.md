# Security Checklist — CV Doktoru

Bu doküman, Faz 7 (Production Readiness) kapsamında yapılan güvenlik
sıkılaştırmalarını, zaten sağlam olan noktaları ve bilinen sınırlamaları listeler.
Genel yayın öncesi son bir kontrol listesi olarak kullanılabilir.

## Faz 7'de Eklenenler

- **IP bazlı rate limiting** — `/auth/register`, `/auth/login`,
  `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`,
  `/auth/reset-password` uçları için IP başına 15 dakikada `AUTH_RATE_LIMIT_PER_15_MIN`
  (varsayılan 10) deneme sınırı (bkz. `app/core/rate_limit_ip.py`). Kasıtlı olarak
  `GET /auth/me`'yi kapsamaz — aksi halde normal kullanımda (birden fazla
  sekme/sayfa yenileme) kullanıcılar kendi oturumlarından "rate limited"
  hatasıyla düşebilirdi.
- **Güvenlik header middleware** — `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  ve `ENVIRONMENT=production` iken ek olarak `Strict-Transport-Security`
  (bkz. `app/core/security_headers.py`).
- **E-posta doğrulama** — Tek kullanımlık, sha256 ile hash'lenmiş, süresi dolan
  token'lar (`UserToken` modeli). Yalnızca AI/maliyetli özellikleri kilitler;
  giriş/kayıt/CV yükleme etkilenmez.
- **Şifre sıfırlama** — Aynı token mekanizması; var olmayan e-posta adresleri
  için de her zaman aynı yanıt (204) döner (enumeration önleme).
- **Prod fail-fast konfigürasyon doğrulaması** — `ENVIRONMENT=production` iken
  `SECRET_KEY` hâlâ varsayılan değerdeyse, `OPENAI_API_KEY`/`SMTP_HOST` boşsa
  veya `STORAGE_BACKEND=s3` iken `S3_BUCKET` tanımlı değilse, uygulama
  **başlangıçta hemen** hata verir; eksik yapılandırmayla sessizce ayağa
  kalkmaz (bkz. `app/core/config.py`).

## Zaten Sağlam Olan Noktalar (Faz 1-6.5'te doğrulandı)

- **Magic-byte dosya doğrulama** — Yüklenen CV dosyaları yalnızca beyan edilen
  content-type'a değil, dosya içeriğinin gerçek imzasına göre de doğrulanır
  (bkz. `app/utils/file_validation.py`), böylece uzantısı değiştirilmiş kötü
  amaçlı dosyalar reddedilir.
- **Ownership kontrolleri** — Tüm kaynak erişimleri (`CV`, `JobDescription`,
  `JobMatch`, `AIOutput`) `get_owned()` desenini kullanır: kayıt başka bir
  kullanıcıya aitse `404` döner (`403` değil), böylece kaynağın var olup
  olmadığı bile sızdırılmaz.
- **Şifre hash'leme** — `bcrypt` ile, salt otomatik üretilir (bkz.
  `app/core/security.py`).
- **Standart hata zarfı** — Tüm hatalar `{"error": {"code", "message"}}`
  formatında döner; stack trace veya iç detay sızdırılmaz.
- **CORS** — `CORS_ORIGINS` ayarına göre yalnızca izin verilen origin'lere açık
  (bkz. `app/main.py`); prod'da bu, gerçek frontend domain'iyle sınırlı olmalı.
- **JWT tabanlı auth** — Bearer token, cookie değil (Flutter gibi diğer
  istemcilerle paylaşılabilir olması için); `is_admin`/`is_email_verified`
  her istekte veritabanından taze okunur, JWT payload'ına gömülmez — yani bir
  kullanıcının yetkisi değiştirildiğinde mevcut token'ı hemen etkilenir.

## Bilinen Sınırlamalar (bilinçli olarak bu fazda çözülmedi)

- **Refresh-token rotasyonu yok** — Yalnızca access token ömrü uzatıldı
  (1 gün). Tam bir refresh-token akışı önemli bir auth refactorü gerektirir;
  bu fazın kapsamı dışında bırakıldı.
- **Rate limiting in-memory'dir** — Tek sunuculu (VPS) deploy için yeterlidir.
  Birden fazla backend instance'ına yatay ölçeklenirse, her instance kendi
  sayaçlarını tutacağından etkin limit instance sayısıyla çarpılır — bu
  durumda Redis tabanlı paylaşımlı bir limitleyiciye geçilmelidir.
- **PNG/ico favicon varyantları yok** — Yalnızca SVG favicon mevcut; gerçek
  görsel varlık üretimi bu fazın kapsamı dışında bırakıldı.

## Yayın Öncesi Son Kontroller

```bash
# Backend bağımlılıklarında bilinen güvenlik açığı taraması
cd backend && uv run pip-audit

# Frontend bağımlılıklarında bilinen güvenlik açığı taraması
cd frontend && npm audit --omit=dev
```

Ayrıca:
- [ ] `backend/.env` içindeki `SECRET_KEY` gerçekten rastgele ve production'a
      özgü mi (`.env.example`'daki varsayılan değer kullanılmıyor mu)?
- [ ] `CORS_ORIGINS` yalnızca gerçek frontend domain'ini içeriyor mu (localhost
      prod'da kalmamalı)?
- [ ] Postgres portu dışa açık değil mi (`docker-compose.prod.yml`'de zaten
      `ports:` yerine yalnızca iç ağ kullanılıyor)?
- [ ] `/docs` (Swagger UI) prod'da halka açık kalması kabul edilebilir mi, yoksa
      erişim kısıtlanmalı mı? (Şu an varsayılan FastAPI davranışıyla açık.)
