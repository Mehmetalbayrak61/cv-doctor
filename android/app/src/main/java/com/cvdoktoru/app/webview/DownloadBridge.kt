package com.cvdoktoru.app.webview

import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.widget.Toast
import com.cvdoktoru.app.R
import java.io.File
import java.io.FileOutputStream

/**
 * Web uygulamasının `handleDownload()` fonksiyonu (Blob + görünmez `<a>.click()`) Android
 * WebView'in `setDownloadListener`'ı tarafından yakalanamaz — o yalnızca gerçek ağ
 * kaynaklarını/Content-Disposition'ı dinler, `blob:` URL'lerini değil. Bu köprü, sayfaya
 * enjekte edilen [DOWNLOAD_INTERCEPT_SCRIPT] tarafından çağrılır: script `blob:` href'li
 * anchor'ların `.click()` çağrısını yakalayıp içeriği base64'e çevirir, buraya iletir.
 *
 * Web uygulamasının kaynak kodunda hiçbir değişiklik gerektirmez.
 */
class DownloadBridge(private val context: Context) {

    private val mainHandler = Handler(Looper.getMainLooper())

    @JavascriptInterface
    fun saveBase64File(base64Data: String, filename: String, mimeType: String) {
        try {
            val bytes = Base64.decode(base64Data, Base64.DEFAULT)
            val safeName = filename.ifBlank { "cv-doktoru-dosya" }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                saveViaMediaStore(bytes, safeName, mimeType)
            } else {
                saveViaLegacyStorage(bytes, safeName)
            }
            notify(context.getString(R.string.download_success, safeName))
        } catch (error: Exception) {
            notify(context.getString(R.string.download_failed))
        }
    }

    private fun saveViaMediaStore(bytes: ByteArray, filename: String, mimeType: String) {
        val resolver = context.contentResolver
        val values = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, filename)
            put(MediaStore.Downloads.MIME_TYPE, mimeType.ifBlank { "application/octet-stream" })
            put(MediaStore.Downloads.IS_PENDING, 1)
        }
        val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            ?: error("MediaStore insert başarısız")
        resolver.openOutputStream(uri)?.use { it.write(bytes) }
        values.clear()
        values.put(MediaStore.Downloads.IS_PENDING, 0)
        resolver.update(uri, values, null, null)
    }

    /** Yalnızca API 26-28 için (scoped storage öncesi) — bkz. manifest'teki
     * `WRITE_EXTERNAL_STORAGE` (maxSdkVersion=28) izni. */
    private fun saveViaLegacyStorage(bytes: ByteArray, filename: String) {
        val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        if (!downloadsDir.exists()) downloadsDir.mkdirs()
        val target = File(downloadsDir, filename)
        FileOutputStream(target).use { it.write(bytes) }
    }

    private fun notify(message: String) {
        mainHandler.post { Toast.makeText(context, message, Toast.LENGTH_LONG).show() }
    }

    companion object {
        const val INTERFACE_NAME = "AndroidDownloader"

        /**
         * `HTMLAnchorElement.prototype.click`'i monkey-patch eder. Bunun şart olmasının
         * nedeni: web uygulamasının indirme kodu anchor'ı DOM'a hiç eklemeden
         * `document.createElement("a")` + `.click()` yapıyor — `document` üzerinde bir
         * `click` event listener'ı (capture/bubble fark etmez) bu senaryoda ASLA
         * tetiklenmez, çünkü olay hiçbir zaman bir DOM ağacında yol bulup yukarı
         * çıkamaz (element ağaca hiç bağlı değil). Prototip seviyesinde patch, ağaca
         * bağlı olup olmamasından bağımsız çalışır.
         */
        val DOWNLOAD_INTERCEPT_SCRIPT = """
            (function() {
              if (window.__cvDoktorDownloadPatched) return;
              window.__cvDoktorDownloadPatched = true;
              var originalClick = HTMLAnchorElement.prototype.click;
              HTMLAnchorElement.prototype.click = function() {
                if (this.href && this.href.indexOf('blob:') === 0 && this.download) {
                  var filename = this.download;
                  var href = this.href;
                  fetch(href).then(function(res) { return res.blob(); }).then(function(blob) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                      var base64 = String(reader.result).split(',')[1];
                      if (window.$INTERFACE_NAME) {
                        window.$INTERFACE_NAME.saveBase64File(base64, filename, blob.type || 'application/octet-stream');
                      }
                    };
                    reader.readAsDataURL(blob);
                  });
                  return;
                }
                return originalClick.call(this);
              };
            })();
        """.trimIndent()
    }
}
