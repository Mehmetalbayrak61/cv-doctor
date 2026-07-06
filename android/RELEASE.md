# Release Build & Signing — CV Doktoru Android

## 1. Upload Keystore Oluşturma

Play App Signing kullanıldığında (Google'ın önerdiği ve bu projede varsayılan yol),
sizin elinizde tuttuğunuz anahtara **upload key** denir; Google, gerçek imzalama
anahtarını (app signing key) kendi tarafında güvenli şekilde saklar. Upload key'i bir
kez üretip güvenli bir yerde (parola yöneticisi + yedek) saklamanız yeterli.

JDK'nın `keytool`'u ile (Android Studio'nun JBR'ı da kullanılabilir):

```bash
keytool -genkeypair -v -keystore upload-keystore.jks -alias cvdoktoru-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Sorulan bilgileri doldurun (ad, organizasyon vb. — Play Store'da gösterilmez, yalnızca
sertifikanın metadata'sı). **Şifreleri not edin, kaybederseniz o keystore'la imzalanmış
uygulamayı bir daha güncelleyemezsiniz** (yeni bir keystore ile güncelleme göndermek,
Play Console'un "key upload reset" sürecini gerektirir).

`upload-keystore.jks` dosyasını `android/` dışında güvenli bir yerde tutun (repoya
girmemeli — zaten `.gitignore`'da `*.jks` hariç tutulmuş durumda).

## 2. `keystore.properties` Doldurma

```bash
cp android/keystore.properties.example android/keystore.properties
```

`android/keystore.properties` içinde `storeFile`/`storePassword`/`keyAlias`/`keyPassword`
gerçek değerlerle doldurulur. Bu dosya `.gitignore`'da — commit edilmez. CI'da
kullanılacaksa şifreler repo secret'ı olarak tutulup build sırasında bu dosya
oluşturulmalı (dosyanın kendisi asla repoya girmemeli).

`app/build.gradle.kts` bu dosyayı otomatik okuyup `release` build type'ına
`signingConfig` olarak bağlar; dosya yoksa (ör. yerel debug-only geliştirme) release
build sessizce imzasız kalır — bu yüzden dosya olmadan `bundleRelease`/`assembleRelease`
çalışır ama Play Console'a yüklenemez bir çıktı üretir.

## 3. Release AAB Üretimi

Play Console **yalnızca `.aab` (Android App Bundle)** kabul eder, `.apk` değil:

```bash
cd android
./gradlew bundleRelease
```

Çıktı: `app/build/outputs/bundle/release/app-release.aab`

Yerel bir cihazda hızlı test için imzalı bir `.apk` de üretilebilir:

```bash
./gradlew assembleRelease
```

## 4. Play App Signing'e Kayıt

İlk sürümü Play Console'a yüklerken "Google'ın uygulama imzalama anahtarınızı
yönetmesine izin ver" seçeneği varsayılan ve önerilendir — yukarıda ürettiğiniz upload
key ile imzalanmış `.aab`'ı Google, kendi sakladığı asıl anahtarla yeniden imzalayıp
dağıtır. Bu sayede upload key sızsa bile Google Play üzerinden yeni bir upload key
talebiyle kurtarma mümkündür.

## 5. `BASE_URL`'in Gerçek Domain'e Güncellenmesi

`app/build.gradle.kts` içindeki `release` build type'ında iki yerde `TODO(Faz 0)`
notuyla işaretli placeholder domain var — Faz 0 (prod deploy) tamamlanıp gerçek domain
netleşince bu değerler güncellenmeli, ardından yeni bir release build alınmalı.
