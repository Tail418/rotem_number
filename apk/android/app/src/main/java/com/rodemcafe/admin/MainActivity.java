package com.rodemcafe.admin;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemBars();

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge().getWebView();
                String url = webView.getUrl();
                boolean onRemoteAdminPage = url != null && (url.startsWith("http://") || url.startsWith("https://"))
                    && !url.contains("localhost");

                if (onRemoteAdminPage) {
                    // 원격 admin.html을 보고 있을 때 뒤로가기를 누르면 앱 종료 대신
                    // 서버 주소를 다시 입력할 수 있는 내장 설정 화면으로 돌아간다.
                    webView.loadUrl(getLauncherUrl());
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }

    private String getLauncherUrl() {
        // capacitor.config.json의 server.androidScheme(http)으로 번들된 index.html이 로드되는 주소.
        // settings=1을 붙여서 저장된 서버 주소로 자동 재이동하지 않고 입력 폼을 보여주게 한다.
        return "http://localhost/index.html?settings=1";
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemBars();
        }
    }

    private void hideSystemBars() {
        // API 35+에서는 레거시 View.SYSTEM_UI_FLAG_* 가 더 이상 시스템 바를 숨기지 않으므로
        // androidx WindowInsetsControllerCompat(edge-to-edge 대응)를 사용한다.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }
}
