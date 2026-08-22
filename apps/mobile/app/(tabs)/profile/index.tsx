import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import type { AuthUser } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";
import { clearToken } from "@/lib/auth";

export default function ProfileScreen() {
  const [me, setMe] = useState<AuthUser | null>(null);

  useEffect(() => {
    apiClient.getMe().then(setMe).catch(() => setMe(null));
  }, []);

  async function logout() {
    await apiClient.logout().catch(() => undefined);
    await clearToken();
    router.replace("/(onboarding)/role-select");
  }

  return (
    <View className="flex-1 gap-4 bg-bg-off-white p-6 pt-16">
      <Text className="font-display text-2xl uppercase text-charcoal-dark">Profile</Text>

      {me && (
        <View className="rounded-lg bg-white p-4 shadow-sm">
          <Text className="text-lg text-charcoal-dark">{me.fullName ?? me.email}</Text>
          <Text className="text-muted-clay-gray">{me.email}</Text>
          <Text className="mt-2 text-boli-green">
            BoliPass: {me.isBoliPassActive ? "Active" : "Not subscribed"}
          </Text>
        </View>
      )}

      <Pressable className="rounded-lg border border-boli-red p-4" onPress={logout}>
        <Text className="text-center text-boli-red">Log out</Text>
      </Pressable>
    </View>
  );
}
