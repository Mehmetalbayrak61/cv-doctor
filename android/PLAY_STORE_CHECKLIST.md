# Google Play Yayın Checklist'i — CV Doktoru

Bu doküman, Android WebView shell hazır olduktan sonra Play Console tarafında
yapılması gereken adımları listeler. Kod/build hazırlığı için bkz. `RELEASE.md`.

## 1. Ön Koşullar

- [ ] Google Play Console geliştirici hesabı (yoksa: tek seferlik $25 kayıt ücreti,
      kimlik doğrulama birkaç gün sürebilir — erkenden açılması önerilir).
- [ ] **Faz 0 tamamlanmış olmalı**: gerçek, HTTPS'li bir production domain'de backend +
      frontend çalışıyor olmalı (`app/build.gradle.kts`'teki `BASE_URL` placeholder'ları
      güncellenip yeni bir release build alınmış olmalı).
- [ ] Upload keystore üretilmiş, `RELEASE.md`'deki adımlarla imzalı `.aab` üretilebiliyor.

## 2. Store Listing (Mağaza Sayfası)

- [ ] Uygulama adı: "CV Doktoru"
- [ ] Kısa açıklama (80 karakter) ve uzun açıklama (4000 karakter) — TR (ve isteğe
      bağlı EN, frontend zaten i18n destekliyor).
- [ ] Ekran görüntüleri: en az 2, telefon için (1080x1920 veya benzeri oran).
      Tablet/7"-10" ekran görüntüsü zorunlu değil ama varsa kaliteyi artırır.
- [ ] Feature graphic (1024x500 PNG/JPG).
- [ ] Uygulama ikonu (512x512 PNG, 32-bit) — `app/src/main/res/mipmap-anydpi-v26/`
      içindeki adaptive icon'dan yüksek çözünürlüklü ayrı bir export gerekir.
- [ ] Kategori: "Business" veya "Productivity".
- [ ] İletişim e-postası (destek).

## 3. Gizlilik ve Veri Güvenliği

- [ ] Gizlilik Politikası URL'i — web uygulamasında zaten var: `https://<domain>/privacy`
      (bkz. `frontend/src/features/legal/privacy-page.tsx`). Play Console bu alanı
      zorunlu kılıyor.
- [ ] **Data Safety formu** — gerçekte toplanan veriye göre doldurulmalı, uydurma
      olmamalı. Backend'de gerçekten toplanan veriler: e-posta adresi, ad/soyad
      (hesap oluşturma), yüklenen CV dosyası içeriği (PDF/DOC/DOCX — kişisel bilgi
      içerebilir), iş ilanı metinleri. Bunlar "toplanıyor" olarak işaretlenmeli;
      şifreleme (HTTPS'te transit, bcrypt'te hash'lenmiş şifreler) ve silme talebi
      imkânı (hesap silme akışı varsa) buna göre beyan edilmeli.
- [x] **Hesap silme (account deletion)** — tamamlandı. `DELETE /auth/me` (şifre
      onaylı, kalıcı silme — `AuthService.delete_account`) + web'de `/account` sayfası
      ("Tehlikeli Bölge" kartı, `frontend/src/features/account/account-page.tsx`).
      Android shell aynı web uygulamasının WebView'i olduğundan `https://<domain>/account`
      normal bir tarayıcıdan da erişilebiliyor — Play Console'un hem "uygulama-içi" hem
      "web üzerinden" silme yolu gereksinimini **tek bir sayfa** karşılıyor, ayrı bir
      pazarlama-sitesi sayfası gerekmedi.

## 4. İçerik Derecelendirmesi ve Hedef Kitle

- [ ] Content rating anketi (IARC) — CV Doktoru şiddet/yetişkin içerik barındırmıyor,
      muhtemelen "Everyone"/"3+" seviyesinde sonuçlanır.
- [ ] Hedef kitle ve içerik: "13 yaş altı çocuklara yönelik değil" seçilecek (iş
      arama/CV ürünü, çocuk kullanıcı kitlesi değil).
- [ ] Reklam beyanı: Uygulamada reklam yok → "Hayır" seçilecek.

## 5. App Content

- [ ] Government apps / Financial features / Health gibi özel kategori beyanları:
      hepsi "Hayır" (CV Doktoru bu kategorilere girmiyor).
- [ ] Ads: yukarıdaki gibi "Hayır".

## 6. Sürüm Yönetimi

- [ ] İlk yükleme **Internal testing** track'ine yapılmalı (kendi ekibinizle/birkaç
      test kullanıcısıyla gerçek Play Store altyapısı üzerinden test).
- [ ] Internal testing'de: login/register, CV yükleme, AI çıktısı indirme, harici link,
      geri tuşu, uçak modu no-internet ekranı manuel doğrulanmalı (bkz. plan
      dosyasındaki "Doğrulama Planı").
- [ ] Sorun yoksa **Production** track'ine terfi (aşamalı yayın/staged rollout %10-20
      ile başlamak önerilir, tek seferde %100 değil).

## 7. Bilinen Sınırlamalar / Sonraki Adımlar

- İkon/splash şu an gerçek marka rengiyle (frontend `--primary` token) tutarlı ama
  **placeholder bir vektör işaret** kullanıyor (bkz. `ic_launcher_foreground.xml`
  içindeki not) — gerçek marka logosu hazır olduğunda değiştirilmesi önerilir.
- iOS, push notification, deep linking bu MVP kapsamında yok (bkz. plan dosyası,
  "Kapsam Dışı").
