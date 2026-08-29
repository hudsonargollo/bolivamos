import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import type { Category } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";
import { storeToken } from "@/lib/auth";
import { registerForPushNotifications } from "@/lib/push";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { categories } = useLocalSearchParams<{ categories?: string }>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [, , promptGoogleLogin] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  async function finishLogin(token: string) {
    await storeToken(token);

    const selectedCategories = (categories?.split(",").filter(Boolean) ?? []) as Category[];
    if (selectedCategories.length > 0) {
      await apiClient.updatePreferences({ categories: selectedCategories });
    }

    await registerForPushNotifications().catch(() => undefined);

    router.replace("/(tabs)");
  }

  async function handleGooglePress() {
    setError(null);
    const result = await promptGoogleLogin();
    if (result.type !== "success" || !result.params.id_token) return;
    setLoading(true);
    try {
      const { token } = await apiClient.loginWithGoogle({ idToken: result.params.id_token, role: "visitor" });
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
      const { token } = await apiClient.devLogin("dev@bolivamos.test", "visitor");
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
      const { token } = await apiClient.login({ email: email.trim(), password });
      await finishLogin(token);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg-off-white p-8">
      <Text className="font-display text-2xl uppercase text-charcoal-dark">Sign in</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          {error && <Text className="text-boli-red">{error}</Text>}

          <TextInput
            className="w-full rounded-lg border border-muted-clay-gray p-4"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="w-full rounded-lg border border-muted-clay-gray p-4"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable className="w-full rounded-lg bg-boli-orange p-4" onPress={handleEmailLogin}>
            <Text className="text-center text-lg text-white">Log in</Text>
          </Pressable>

          <Text className="text-muted-clay-gray">or</Text>

          <Pressable className="w-full rounded-lg bg-boli-green p-4" onPress={handleGooglePress}>
            <Text className="text-center text-lg text-white">Continue with Google</Text>
          </Pressable>

          {__DEV__ && (
            <Pressable className="w-full rounded-lg border border-muted-clay-gray p-4" onPress={handleDevLogin}>
              <Text className="text-center text-muted-clay-gray">Continue as test user (dev only)</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
