import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Release imzalama bilgileri repoya girmez; `keystore.properties` yalnızca yerelde
// (veya CI secret'ı olarak) var olur (bkz. Faz 5 / android/RELEASE.md).
val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(keystorePropertiesFile.inputStream())
}

android {
    namespace = "com.cvdoktoru.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.cvdoktoru.app"
        // API 26+ (Android 8.0): adaptive icon'lar native destekleniyor, legacy raster
        // mipmap fallback'ine gerek kalmıyor. 2026 itibarıyla API 24-25 payı ihmal
        // edilebilir düzeyde (bkz. plan dosyasındaki not).
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }

    signingConfigs {
        create("release") {
            if (keystorePropertiesFile.exists()) {
                storeFile = file(keystoreProperties.getProperty("storeFile"))
                storePassword = keystoreProperties.getProperty("storePassword")
                keyAlias = keystoreProperties.getProperty("keyAlias")
                keyPassword = keystoreProperties.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            // Vercel'de deploy edilmiş gerçek frontend — Cloudflare tünel/localhost/
            // 10.0.2.2 artık kullanılmıyor. TODO(Faz 0): özel domain netleşince
            // (custom domain kararı ertelendi) bu değeri güncelleyin.
            buildConfigField(
                "String",
                "BASE_URL",
                "\"https://frontend-rho-five-9w6q9iwywu.vercel.app\""
            )
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // TODO(Faz 0): Özel domain kararı verilince gerçek production domain'i yazın.
            buildConfigField(
                "String",
                "BASE_URL",
                "\"https://frontend-rho-five-9w6q9iwywu.vercel.app\""
            )
            if (keystorePropertiesFile.exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
}
