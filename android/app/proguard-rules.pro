# WebView, @JavascriptInterface metodlarını reflection ile çağırır — R8 bunları
# obfuscate/strip ederse (release'te minifyEnabled=true olduğu için) DownloadBridge
# JS köprüsü sessizce bozulur. Bu yüzden açıkça korunuyor (bkz. plan dosyasındaki
# "release'te R8 nedeniyle bozulabilecek JS-bridge senaryoları" doğrulama notu).
-keepclassmembers class com.cvdoktoru.app.webview.DownloadBridge {
    public *;
}
-keepattributes JavascriptInterface
