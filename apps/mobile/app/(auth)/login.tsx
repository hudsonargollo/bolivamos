import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
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

  const [, , promptGoogleLogin] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  async function completeLogin(idToken?: string) {
    setLoading(true);
    try {
      const { token } = idToken
        ? await apiClient.loginWithGoogle({ idToken, role: "visitor" })
        : await apiClient.devLogin("dev@bolivamos.test", "visitor");

      await storeToken(token);

      const selectedCategories = (categories?.split(",").filter(Boolean) ?? []) as Category[];
      if (selectedCategories.length > 0) {
        await apiClient.updatePreferences({ categories: selectedCategories });
      }

      await registerForPushNotifications().catch(() => undefined);

      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  }

  async function handleGooglePress() {
    const result = await promptGoogleLogin();
    if (result.type === "success" && result.params.id_token) {
      await completeLogin(result.params.id_token);
    }
  }

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-bg-off-white p-8">
      <Text className="font-display text-2xl uppercase text-charcoal-dark">Sign in</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Pressable className="w-full rounded-lg bg-boli-green p-4" onPress={handleGooglePress}>
            <Text className="text-center text-lg text-white">Continue with Google</Text>
          </Pressable>

          {__DEV__ && (
            <Pressable
              className="w-full rounded-lg border border-muted-clay-gray p-4"
              onPress={() => completeLogin()}
            >
              <Text className="text-center text-muted-clay-gray">Continue as test user (dev only)</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
