import { useRef, useState } from "react";
import { View, ActivityIndicator, Share } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { baseUrl } from "@/lib/api";
import { nativeColors } from "@bolivamos/design-tokens/native";

/**
 * Embeds the themed 3D map (apps/web/app/city3d) via WebView rather than
 * rebuilding navigation/rendering natively (PRD §8.4 v1 scope — a native
 * MapLibre rewrite is explicitly deferred). `embed=1` tells the web page to
 * hide its own "back to home" chrome, since that's redundant inside a
 * native tab. Native-side bridging: the web page's share button posts a
 * message here (see city-scene.js's `window.ReactNativeWebView` check)
 * instead of calling the Web Share API, which WebViews don't implement.
 */
export default function MapScreen() {
  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  function onMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "share") {
        Share.share({ message: `${data.title} ${data.url}`.trim(), url: data.url, title: data.title }).catch(() => {});
      }
    } catch {
      // Non-JSON or unrecognized message — ignore rather than crash the bridge.
    }
  }

  return (
    <View className="flex-1 bg-bg-off-white">
      <WebView
        ref={webviewRef}
        source={{ uri: `${baseUrl}/city3d?embed=1` }}
        onMessage={onMessage}
        onLoadEnd={() => setLoading(false)}
        geolocationEnabled
        originWhitelist={["*"]}
        style={{ flex: 1 }}
      />
      {loading ? (
        <View className="absolute inset-0 items-center justify-center bg-bg-off-white">
          <ActivityIndicator size="large" color={nativeColors.boliOrange} />
        </View>
      ) : null}
    </View>
  );
}
