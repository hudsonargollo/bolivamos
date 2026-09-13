import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { decodeSessionUnsafe, type Category } from "@bolivibes/api-schema";
import { apiClient, baseUrl, isLocalApi } from "@/lib/api";
import { storeToken } from "@/lib/auth";
import { registerForPushNotifications } from "@/lib/push";
import { BrandIcon } from "@/components/BrandIcon";
import { useT } from "@/lib/i18n";

const HERO_SCENE_URL = `${baseUrl}/embed/hero`;
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

const PERSONAL_GOALS: { key: Category; label: string }[] = [
  { key: "music", label: "Live music" },
  { key: "nightlife", label: "Nightlife" },
  { key: "gastronomy", label: "Food" },
  { key: "cultural", label: "Culture" },
  { key: "historical", label: "Tradition" },
];

const BUSINESS_GOALS = ["Get discovered", "Promote events", "Sell tickets", "Offer BoliPass deals", "Host tourists"];

type AccountType = "personal" | "business";

WebBrowser.maybeCompleteAuthSession();

function AccountTypeCard({ type, active, title, body, icon, onPress }: { type: AccountType; active: boolean; title: string; body: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-2xl border p-4 ${active ? "border-clay-terracotta bg-[#fff7ea] shadow-clay" : "border-[#dccbaa] bg-white/75"}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${title} account`}
    >
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: active ? "#c4703d" : "#efe4d2" }}>
        <Ionicons name={icon} size={18} color={active ? "#fffaf0" : "#8f4225"} />
      </View>
      <Text className="font-bold text-sm text-charcoal-dark">{title}</Text>
      <Text className="mt-1 text-xs font-semibold leading-5 text-muted-clay-gray">{body}</Text>
      <Text className="mt-3 text-[10px] font-bold uppercase tracking-[1px] text-[#b0532f]">{type === "personal" ? "Freemium user" : "Freemium venue"}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const { t } = useT();
  const { categories } = useLocalSearchParams<{ categories?: string }>();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(categories?.split(",").filter(Boolean) ?? []);
  const [error, setError] = useState<string | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const googleConfigured = Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  );

  const [, , promptGoogleLogin] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "unconfigured",
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "unconfigured",
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "unconfigured",
  });

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]));
  }

  async function finishLogin(token: string) {
    await storeToken(token);

    if (decodeSessionUnsafe(token)?.role === "host") {
      router.replace("/host-redirect");
      return;
    }

    const selectedCategories = selectedGoals.filter((goal): goal is Category => PERSONAL_GOALS.some((item) => item.key === goal));
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
        role: accountType === "business" ? "host" : "visitor",
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
      const { token } = await apiClient.devLogin("dev@bolivibes.test", accountType === "business" ? "host" : "visitor");
      await finishLogin(token);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth() {
    if (!email.trim() || !password) return;
    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signup" && accountType === "personal" && !fullName.trim()) {
      setError("Add your name so friends and venues recognize you.");
      return;
    }
    if (mode === "signup" && accountType === "business" && !businessName.trim()) {
      setError("Add your business or venue name.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { token } =
        mode === "signup"
          ? await apiClient.signup({
              email: normalizedEmail,
              password,
              fullName: accountType === "business" ? businessName.trim() : fullName.trim(),
              role: accountType === "business" ? "host" : "visitor",
            })
          : await apiClient.login({ email: normalizedEmail, password });
      await finishLogin(token);
    } catch {
      setError(mode === "signup" ? "Couldn't create that account. The email may already be registered." : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  const logoScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const logoTranslate = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const goalOptions = accountType === "business" ? BUSINESS_GOALS : PERSONAL_GOALS.map((goal) => goal.label);

  return (
    <SafeAreaView className="flex-1 bg-charcoal-dark">
      {!sceneFailed && (
        <View className="absolute inset-x-0 top-0 h-[300px] opacity-80">
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

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8 pt-8" keyboardShouldPersistTaps="handled">
        <View className="items-center pb-5 pt-3">
          <Animated.View style={{ transform: [{ translateY: logoTranslate }, { scale: logoScale }] }}>
            <BrandIcon size={112} />
          </Animated.View>
          <Text className="mt-2 rounded-pill bg-black/35 px-4 py-2 text-center font-bold text-xs uppercase tracking-[1.5px] text-[#f7f1e4]">
            Personal + Business freemium
          </Text>
        </View>

        <View className="rounded-[34px] bg-bg-off-white p-5 shadow-clay dark:bg-dark-bg">
          <Text className="font-display text-[30px] leading-9 text-charcoal-dark dark:text-dark-ink">
            {mode === "signup" ? "Create your BoliVibes account" : t("signIn")}
          </Text>
          <Text className="mt-2 font-bold text-sm leading-6 text-muted-clay-gray dark:text-dark-sub">
            {mode === "signup" ? "Choose how you’ll use BoliVibes. We only ask what helps personalize the first session." : "Welcome back. Sign in to sync your plans, perks, and host tools."}
          </Text>

          <View className="mt-5 flex-row rounded-pill bg-clay-terracotta/10 p-1">
            <Pressable className={`flex-1 rounded-pill py-3 ${mode === "login" ? "bg-clay-terracotta" : ""}`} onPress={() => { setMode("login"); setError(null); }}>
              <Text className={`text-center font-bold ${mode === "login" ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>{t("signIn")}</Text>
            </Pressable>
            <Pressable className={`flex-1 rounded-pill py-3 ${mode === "signup" ? "bg-clay-terracotta" : ""}`} onPress={() => { setMode("signup"); setError(null); }}>
              <Text className={`text-center font-bold ${mode === "signup" ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>Create account</Text>
            </Pressable>
          </View>

          {error && <Text className="mt-4 rounded-xl bg-clay-danger/10 p-3 text-sm font-bold text-clay-danger">{error}</Text>}

          {loading ? (
            <View className="py-8"><ActivityIndicator /></View>
          ) : (
            <View className="mt-5 gap-4">
              {mode === "signup" && (
                <View className="gap-3">
                  <Text className="font-bold text-xs uppercase tracking-[1.3px] text-muted-clay-gray">I am joining as</Text>
                  <View className="flex-row gap-3">
                    <AccountTypeCard type="personal" active={accountType === "personal"} title="Personal" body="Discover plans, perks, and people." icon="person-outline" onPress={() => setAccountType("personal")} />
                    <AccountTypeCard type="business" active={accountType === "business"} title="Business" body="For venues, hosts, guides, and brands." icon="storefront-outline" onPress={() => setAccountType("business")} />
                  </View>
                </View>
              )}

              {mode === "signup" && accountType === "personal" && (
                <TextInput className="rounded-xl border border-muted-clay-gray bg-white p-4 dark:border-dark-muted dark:bg-dark-card1 dark:text-dark-ink" placeholder="Your name" value={fullName} onChangeText={setFullName} textContentType="name" />
              )}
              {mode === "signup" && accountType === "business" && (
                <TextInput className="rounded-xl border border-muted-clay-gray bg-white p-4 dark:border-dark-muted dark:bg-dark-card1 dark:text-dark-ink" placeholder="Business or venue name" value={businessName} onChangeText={setBusinessName} />
              )}

              <TextInput className="rounded-xl border border-muted-clay-gray bg-white p-4 dark:border-dark-muted dark:bg-dark-card1 dark:text-dark-ink" placeholder="Email" autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" value={email} onChangeText={setEmail} />
              <View className="flex-row items-center rounded-xl border border-muted-clay-gray bg-white pr-2 dark:border-dark-muted dark:bg-dark-card1">
                <TextInput className="flex-1 p-4 dark:text-dark-ink" placeholder="Password" secureTextEntry={!passwordVisible} textContentType={mode === "signup" ? "newPassword" : "password"} value={password} onChangeText={setPassword} />
                <Pressable onPress={() => setPasswordVisible((v) => !v)} hitSlop={8}>
                  <Text className="px-2 text-muted-clay-gray">{passwordVisible ? "Hide" : "Show"}</Text>
                </Pressable>
              </View>

              {mode === "signup" && (
                <View className="gap-2">
                  <Text className="font-bold text-xs uppercase tracking-[1.3px] text-muted-clay-gray">Preferences</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {goalOptions.map((goal) => {
                      const active = selectedGoals.includes(goal) || PERSONAL_GOALS.some((item) => item.label === goal && selectedGoals.includes(item.key));
                      const value = PERSONAL_GOALS.find((item) => item.label === goal)?.key ?? goal;
                      return (
                        <Pressable key={goal} onPress={() => toggleGoal(value)} className={`rounded-pill border px-3 py-2 ${active ? "border-clay-terracotta bg-clay-terracotta" : "border-[#dccbaa] bg-white"}`}>
                          <Text className={`text-xs font-bold ${active ? "text-white" : "text-charcoal-dark"}`}>{goal}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <Pressable className="rounded-pill bg-clay-terracotta p-4 shadow-clay active:translate-y-[3px]" onPress={handleEmailAuth}>
                <Text className="text-center text-lg font-bold text-white">{mode === "signup" ? (accountType === "business" ? "Create business account" : "Create personal account") : t("signIn")}</Text>
              </Pressable>

              {googleConfigured && (
                <>
                  <Text className="text-center text-muted-clay-gray">or</Text>
                  <Pressable className="rounded-pill bg-boli-green p-4 shadow-clay active:translate-y-[3px]" onPress={handleGooglePress}>
                    <Text className="text-center text-lg font-bold text-white">{t("continueWithGoogle")}</Text>
                  </Pressable>
                </>
              )}

              {__DEV__ && isLocalApi && (
                <Pressable className="rounded-xl border border-muted-clay-gray p-4" onPress={handleDevLogin}>
                  <Text className="text-center text-muted-clay-gray">Continue as test {accountType} (dev only)</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
