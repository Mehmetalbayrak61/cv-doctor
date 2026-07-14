package com.cvdoktoru.app

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Uri
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Toast
import androidx.activity.addCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.cvdoktoru.app.databinding.ActivityMainBinding
import com.cvdoktoru.app.network.NetworkMonitor
import com.cvdoktoru.app.webview.AppWebChromeClient
import com.cvdoktoru.app.webview.AppWebViewClient
import com.cvdoktoru.app.webview.DownloadBridge
import java.net.URI

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var pendingFileCallback: ((Array<Uri>?) -> Unit)? = null
    private var connectivityCallback: ConnectivityManager.NetworkCallback? = null

    private val fileChooserLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val callback = pendingFileCallback
            pendingFileCallback = null
            val uris = if (result.resultCode == Activity.RESULT_OK) extractUris(result.data) else null
            callback?.invoke(uris)
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setTheme(R.style.Theme_CvDoktoru)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setUpEdgeToEdgeInsets()

        setUpWebView()
        setUpBackNavigation()
        binding.retryButton.setOnClickListener { attemptLoad() }

        attemptLoad()
    }

    /**
     * API 35+'te `android:statusBarColor`/`fitsSystemWindows` artık yok sayılıyor ve
     * içerik zorla edge-to-edge çiziliyor — bu düzeltme olmadan WebView'in üst
     * navigasyonu (ör. "Giriş Yap") durum çubuğunun dokunma alanının ALTINDA değil
     * İÇİNDE render oluyor ve dokunuşlar uygulamaya değil sistem durum çubuğuna gidiyor
     * (Pixel 7 / API 37 emülatöründe doğrulandı). Kök içeriği durum/gezinme çubuğu
     * kadar içeri boşluklayıp durum çubuğu ikonlarını koyu (uygulamanın beyaz arka
     * planına uygun) yaparak düzeltilir.
     */
    private fun setUpEdgeToEdgeInsets() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightStatusBars = true
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            insets
        }
    }

    private fun setUpWebView() {
        val webView = binding.webView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true // JWT/localStorage + i18next için şart
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        }
        // Yalnızca debug build'de açık — release'te WebView içerik hata ayıklaması kapalı.
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)

        val allowedHost = URI(BuildConfig.BASE_URL).host
        webView.webViewClient = AppWebViewClient(
            allowedHost = allowedHost,
            onExternalLink = ::openExternalBrowser,
            onLoadResult = ::onLoadResult,
        )
        webView.webChromeClient = AppWebChromeClient { intent, callback ->
            pendingFileCallback = callback
            fileChooserLauncher.launch(intent)
        }
        webView.addJavascriptInterface(DownloadBridge(this), DownloadBridge.INTERFACE_NAME)
    }

    private fun setUpBackNavigation() {
        onBackPressedDispatcher.addCallback(this) {
            if (binding.webView.canGoBack()) {
                binding.webView.goBack()
            } else {
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
            }
        }
    }

    private fun attemptLoad() {
        stopAwaitingConnection()
        if (NetworkMonitor.isOnline(this)) {
            showOffline(false)
            binding.webView.loadUrl(BuildConfig.BASE_URL)
        } else {
            showOffline(true)
            connectivityCallback = NetworkMonitor.awaitConnection(this) {
                runOnUiThread { attemptLoad() }
            }
        }
    }

    private fun onLoadResult(success: Boolean) {
        if (success) return
        showOffline(true)
        // Cihazın kendisi zaten çevrimiçiyse (ör. DNS hatası/sunucu erişilemez —
        // "internet yok" değil, "bu adrese ulaşılamıyor" durumu) bağlantı hiç
        // değişmeyeceğinden NetworkCallback beklemenin anlamı yok ve anında tekrar
        // tetiklenip sonsuz döngüye yol açabilir — bu durumda kullanıcı "Tekrar
        // Dene"ye elle basar. Yalnızca gerçekten çevrimdışıyken otomatik bekleriz.
        if (!NetworkMonitor.isOnline(this)) {
            connectivityCallback = NetworkMonitor.awaitConnection(this) {
                runOnUiThread { attemptLoad() }
            }
        }
    }

    private fun showOffline(offline: Boolean) {
        binding.offlineContainer.visibility = if (offline) android.view.View.VISIBLE else android.view.View.GONE
        binding.webView.visibility = if (offline) android.view.View.GONE else android.view.View.VISIBLE
    }

    private fun stopAwaitingConnection() {
        connectivityCallback?.let { NetworkMonitor.stopAwaiting(this, it) }
        connectivityCallback = null
    }

    private fun openExternalBrowser(uri: Uri) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri))
        } catch (error: ActivityNotFoundException) {
            Toast.makeText(this, getString(R.string.load_error_title), Toast.LENGTH_SHORT).show()
        }
    }

    private fun extractUris(data: Intent?): Array<Uri>? {
        val clipData = data?.clipData
        val singleUri = data?.data
        return when {
            clipData != null -> Array(clipData.itemCount) { index -> clipData.getItemAt(index).uri }
            singleUri != null -> arrayOf(singleUri)
            else -> null
        }
    }

    override fun onDestroy() {
        stopAwaitingConnection()
        binding.webView.destroy()
        super.onDestroy()
    }
}
