import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { decodeSessionUnsafe, type Category } from "@bolivamos/api-schema";
import { apiClient, baseUrl } from "@/lib/api";
import { storeToken } from "@/lib/auth";
import { registerForPushNotifications } from "@/lib/push";
import { useT } from "@/lib/i18n";

/** The real bolivamos-sunrise 3D scene from the web homepage, bare-embedded. */
const HERO_SCENE_URL = `${baseUrl}/embed/hero`;

// The stage's export toolbar ("Download OBJ+MTL" / "Download GLB") lives
// inside <three-d-stage>'s shadow DOM, which the embed page's own CSS can't
// reach — scene.js hides it too, but not reliably inside a WebView, so
// force it here as well.
const HIDE_STAGE_TOOLBAR_JS = `
  (function poll() {
    const stage = document.querySelector('three-d-stage');
    if (stage && stage.shadowRoot) {
      stage.shadowRoot.querySelectorAll('.toolbar, .note').forEach((el) => {
        el.style.display = 'none';
      });
    }
    setTimeout(poll, 500);
  })();
  true;
`;

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { t } = useT();
  const { categories } = useLocalSearchParams<{ categories?: string }>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);

  const googleConfigured = Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  );

  // useIdTokenAuthRequest throws if the client ID for the current platform is
  // undefined, so it always needs a defined value even when Google sign-in
  // isn't configured yet — the button below is hidden in that case instead.
  const [, , promptGoogleLogin] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "unconfigured",
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "unconfigured",
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "unconfigured",
  });

  async function finishLogin(token: string) {
    await storeToken(token);

    if (decodeSessionUnsafe(token)?.role === "host") {
      router.replace("/host-redirect");
      return;
    }

    const selectedCategories = (categories?.split(",").filter(Boolean) ??
      []) as Category[];
    if (selectedCategories.length > 0) {
      await apiClient.updatePreferences({ categories: selectedCategories });
    }

    await registerForPushNotifications().catch(() => undefined);

    router.replace("/(tabs)/feed");
  }

  async function handleGooglePress() {
    setError(null);
    const result = await promptGoogleLogin();
    if (result.type !== "success" || !result.params.id_token) return;
    setLoading(true);
    try {
      const { token } = await apiClient.loginWithGoogle({
        idToken: result.params.id_token,
        role: "visitor",
      });
      await finishLogin(token);
    } catch {
      setError("Couldn't sign in with Google. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDevLogin() {
    setLoading(true);
    try {
      const { token } = await apiClient.devLogin(
        "dev@bolivamos.test",
        "visitor",
      );
      await finishLogin(token);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin() {
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    try {
      const { token } = await apiClient.login({
        email: email.trim(),
        password,
      });
      await finishLogin(token);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-charcoal-dark">
      {!sceneFailed && (
        <View className="h-[420px] w-full">
          <WebView
            source={{ uri: HERO_SCENE_URL }}
            style={{ flex: 1, backgroundColor: "transparent" }}
            scrollEnabled={false}
            bounces={false}
            allowsInlineMediaPlayback
            injectedJavaScript={HIDE_STAGE_TOOLBAR_JS}
            onError={() => setSceneFailed(true)}
            onHttpError={() => setSceneFailed(true)}
          />
        </View>
      )}

      <ScrollView
        className="flex-1 -mt-6 rounded-t-sheet bg-bg-off-white dark:bg-dark-bg"
        contentContainerClassName="items-center gap-4 p-8"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-display text-2xl text-charcoal-dark dark:text-dark-ink">
          {t("signIn")}
        </Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            {error && <Text className="text-clay-danger">{error}</Text>}

            <TextInput
              className="w-full rounded-xl border border-muted-clay-gray p-4 dark:border-dark-muted dark:text-dark-ink"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <View className="w-full flex-row items-center rounded-xl border border-muted-clay-gray pr-2 dark:border-dark-muted">
              <TextInput
                className="flex-1 p-4 dark:text-dark-ink"
                placeholder="Password"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setPasswordVisible((v) => !v)}
                hitSlop={8}
              >
                <Text className="px-2 text-muted-clay-gray">
                  {passwordVisible ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
            <Pressable
              className="w-full rounded-pill bg-clay-terracotta p-4 shadow-clay active:translate-y-[3px]"
              onPress={handleEmailLogin}
            >
              <Text className="text-center text-lg font-bold text-white">{t("signIn")}</Text>
            </Pressable>

            {googleConfigured && (
              <>
                <Text className="text-muted-clay-gray">or</Text>

                <Pressable
                  className="w-full rounded-pill bg-boli-green p-4 shadow-clay active:translate-y-[3px]"
                  onPress={handleGooglePress}
                >
                  <Text className="text-center text-lg font-bold text-white">
                    {t("continueWithGoogle")}
                  </Text>
                </Pressable>
              </>
            )}

            {__DEV__ && (
              <Pressable
                className="w-full rounded-xl border border-muted-clay-gray p-4"
                onPress={handleDevLogin}
              >
                <Text className="text-center text-muted-clay-gray">
                  Continue as test user (dev only)
                </Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
