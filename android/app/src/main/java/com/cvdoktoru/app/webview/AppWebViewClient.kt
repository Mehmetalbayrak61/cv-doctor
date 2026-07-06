package com.cvdoktoru.app.webview

import android.graphics.Bitmap
import android.net.Uri
import android.net.http.SslError
import android.webkit.SslErrorHandler
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * WebView'in yalnızca [allowedHost] + HTTPS'i kendi içinde yüklemesini sağlar; farklı bir
 * host'a gidilmeye çalışılırsa [onExternalLink] ile harici tarayıcıya devredilir. Bu
 * uygulamanın genel amaçlı bir "mini tarayıcı" değil, tek bir domain'e bağlı bir shell
 * olmasını garanti eder (Play Store politikası + güvenlik açısından önemli).
 */
class AppWebViewClient(
    private val allowedHost: String,
    private val onExternalLink: (Uri) -> Unit,
    private val onLoadResult: (success: Boolean) -> Unit,
) : WebViewClient() {

    private var mainFrameError = false

    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        val uri = request.url
        val isAllowed = uri.scheme == "https" && uri.host == allowedHost
        if (isAllowed) return false

        onExternalLink(uri)
        return true
    }

    override fun onReceivedSslError(view: WebView, handler: SslErrorHandler, error: SslError) {
        // Fail-closed: sertifika hatasında asla "devam et" verilmez.
        handler.cancel()
    }

    override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        mainFrameError = false
    }

    override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
        super.onReceivedError(view, request, error)
        // Bazı WebView sürümlerinde ana çerçeve (main frame) hatasından sonra
        // onPageFinished hiç tetiklenmiyor (WebView kendi native hata sayfasını
        // gösterip orada kalıyor) — bu yüzden [onLoadResult] burada da doğrudan
        // çağrılır, yalnızca bayrak set edip onPageFinished'ı beklemek yetmiyor.
        if (request.isForMainFrame && !mainFrameError) {
            mainFrameError = true
            onLoadResult(false)
        }
    }

    override fun onReceivedHttpError(
        view: WebView,
        request: WebResourceRequest,
        errorResponse: WebResourceResponse,
    ) {
        super.onReceivedHttpError(view, request, errorResponse)
        if (request.isForMainFrame && !mainFrameError) {
            mainFrameError = true
            onLoadResult(false)
        }
    }

    override fun onPageFinished(view: WebView, url: String) {
        super.onPageFinished(view, url)
        if (mainFrameError) return
        view.evaluateJavascript(DownloadBridge.DOWNLOAD_INTERCEPT_SCRIPT, null)
        onLoadResult(true)
    }
}
