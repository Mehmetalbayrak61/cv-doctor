package com.cvdoktoru.app.webview

import android.content.Intent
import android.net.Uri
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView

/**
 * CV yükleme `<input type="file" accept=".pdf,.doc,.docx">` içindir — web tarafında
 * `capture` attribute'u olmadığı doğrulandı, bu yüzden kamera değil yalnızca sistem
 * doküman seçici gerekiyor.
 *
 * [launchFileChooser], MainActivity'nin sahip olduğu bir `ActivityResultLauncher`'ı
 * çağırır (deprecated `startActivityForResult`/`onActivityResult` yerine).
 */
class AppWebChromeClient(
    private val launchFileChooser: (Intent, (Array<Uri>?) -> Unit) -> Unit,
) : WebChromeClient() {

    override fun onShowFileChooser(
        webView: WebView,
        filePathCallback: ValueCallback<Array<Uri>>,
        fileChooserParams: FileChooserParams,
    ): Boolean {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(
                Intent.EXTRA_MIME_TYPES,
                arrayOf(
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ),
            )
        }

        launchFileChooser(intent) { uris ->
            filePathCallback.onReceiveValue(uris ?: emptyArray())
        }
        return true
    }
}
