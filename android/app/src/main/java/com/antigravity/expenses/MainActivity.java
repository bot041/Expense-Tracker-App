package com.antigravity.expenses;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = this.getBridge().getWebView();
        WebSettings webSettings = webView.getSettings();

        // 1. Disable Caching for Development
        // Forces WebView to pull fresh files from assets/public on every load
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.clearCache(true);

        // 2. Performance & UI consistency
        webSettings.setDomStorageEnabled(true);
        
        // Use Hardware Acceleration for high-fidelity Figma transitions
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

        // 3. Modern Dark Mode support (Prime Theme)
        // For Target SDK 33+, setForceDark is a no-op. We use ALGORITHMIC_DARKENING.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(webSettings, true);
        }
    }
}
