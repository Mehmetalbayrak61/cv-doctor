# Deployment Checklist — CV Doktoru

Bu doküman, CV Doktoru'nu self-hosted bir VPS üzerinde Docker Compose + Caddy ile
production'a almak için izlenecek adımları listeler. Hedef: tek sunuculu bir VPS
(ör. Hetzner, DigitalOcean) üzerinde Docker destekli bir Linux dağıtımı.

## 1. Ön Koşullar

- Bir VPS (en az 2 GB RAM önerilir) ve üzerinde Docker + Docker Compose kurulu.
- Bir domain adı, DNS A kaydı VPS'in IP adresine yönlendirilmiş.
- Bir OpenAI API anahtarı.
- Bir SMTP hesabı (Gmail, SES, SendGrid, Postmark, Resend-SMTP — herhangi biri).
  Provider-agnostic olduğu için host/port/kullanıcı adı/şifre yeterli.
- (Opsiyonel) S3/R2/Supabase Storage kimlik bilgileri — kullanılmayacaksa
  `STORAGE_BACKEND=local` ile devam edilebilir, ancak bu durumda dosyalar
  konteynerin volume'unda kalır ve VPS'in kendisi yedeklenmelidir.

## 2. Ortam Değişkenlerini Hazırla

```bash
git clone <repo-url> cv-doktor && cd cv-doktor
cp backend/.env.example backend/.env
```

`backend/.env` içinde aşağıdakileri **mutlaka** doldurun:

- `ENVIRONMENT=production` — bu değer, aşağıdaki alanlardan biri eksikse
  uygulamanın **başlangıçta hemen hata vermesini** sağlar (fail-fast, bkz.
  `app/core/config.py`), böylece eksik yapılandırmayla sessizce ayağa kalkmaz.
- `SECRET_KEY` — rastgele, uzun bir değer (`openssl rand -hex 32`).
- `DATABASE_URL` — `docker-compose.prod.yml` bunu otomatik olarak Postgres
  servisine göre ayarlar; elle değiştirmenize gerek yoktur.
- `CORS_ORIGINS` — `["https://your-domain.com"]`
- `FRONTEND_URL` — `https://your-domain.com` (doğrulama/sıfırlama e-postalarındaki
  linkler bu adrese göre oluşturulur)
- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_USE_TLS`,
  `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`
- `STORAGE_BACKEND` — `local` veya `s3` (s3 seçiliyse `S3_BUCKET` ve ilgili
  kimlik bilgileri de zorunlu)

Repo kökünde bir `.env` dosyası oluşturup Postgres kimlik bilgilerini ve
frontend'in build-time API URL'ini tanımlayın (docker-compose.prod.yml bunları okur):

```bash
cat > .env <<'EOF'
POSTGRES_USER=cvdoktor
POSTGRES_PASSWORD=<güçlü-bir-şifre>
POSTGRES_DB=cvdoktor
VITE_API_URL=https://your-domain.com/api/v1
EOF
```

## 3. Caddy ile Reverse Proxy + Otomatik HTTPS

```bash
cp Caddyfile.example Caddyfile
# Caddyfile içindeki "your-domain.com" kısmını gerçek domain'inizle değiştirin.
```

Caddy'yi aynı Docker ağında çalıştırın (compose dosyasına eklemek isterseniz,
resmi `caddy:2-alpine` imajını kullanıp 80/443 portlarını dışa açın ve
`backend`/`frontend` servisleriyle aynı network'e bağlayın). Caddy, belirtilen
domain için Let's Encrypt sertifikasını otomatik alır ve yeniler.

## 4. Uygulamayı Ayağa Kaldır

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Bu komut:
- Postgres'i başlatır ve sağlıklı olmasını bekler.
- Backend imajını derler; konteyner başlarken `docker-entrypoint.sh`
  otomatik olarak `alembic upgrade head` çalıştırır, ardından uvicorn'u başlatır.
- Frontend imajını `VITE_API_URL` build-arg'ıyla derler ve nginx ile sunar.

## 5. Doğrulama

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend --tail 50
curl -I https://your-domain.com
curl https://your-domain.com/api/v1/docs
```

Ardından tarayıcıdan gerçek bir kullanıcı akışını manuel olarak test edin: kayıt ol
→ doğrulama e-postası gelsin → linke tıkla → bir CV yükle → analiz et. Faz 6.5'te
yazılan Playwright smoke test script'i, `VITE_API_URL`'i prod domain'e işaret
edecek şekilde küçük bir değişiklikle prod'a karşı da çalıştırılabilir.

## 6. İlk Admin Kullanıcıyı Ata

Self-serve admin oluşturma yoktur (güvenlik nedeniyle). İlk admin'i veritabanında
elle işaretleyin:

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U cvdoktor -d cvdoktor \
  -c "UPDATE users SET is_admin = true WHERE email = 'you@example.com';"
```

Bu değişiklik, kullanıcı tekrar giriş yapmasına gerek kalmadan bir sonraki
isteğinde etkili olur (`is_admin` her istekte veritabanından okunur, JWT'ye
gömülmez).

## 7. Yedekleme

Postgres verisi `cv_doktor_pg_data` volume'unda tutulur. Düzenli bir yedek için:

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U cvdoktor cvdoktor | gzip > backup-$(date +%F).sql.gz
```

Bunu bir cron job'a bağlayın ve yedekleri sunucu dışına (ör. S3/R2) taşıyın.
`STORAGE_BACKEND=local` kullanıyorsanız `cv_doktor_storage` volume'unu da
(yüklenen CV dosyaları) aynı şekilde yedekleyin.

## 8. Güncelleme / Rollback

Güncelleme:
```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Rollback (önceki bir commit'e dönmek):
```bash
git checkout <önceki-commit>
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Migration'lar geriye dönük uyumsuzsa (nadiren), önce `alembic downgrade` ile
şemayı geri almanız gerekebilir — bunu yapmadan önce mutlaka bir Postgres
yedeği alın.

## 9. Bilinen Sınırlamalar

- Rate limiting in-memory'dir (tek instance için yeterli). Birden fazla backend
  instance'ına ölçeklenirse Redis tabanlı bir çözüme geçilmeli.
- Access token ömrü uzun tutulur (1 gün); tam refresh-token rotasyonu bu fazın
  kapsamı dışındadır (bkz. SECURITY_CHECKLIST.md).
- PNG/ico favicon varyantları (apple-touch-icon vb.) eklenmedi — yalnızca SVG
  favicon mevcut.
