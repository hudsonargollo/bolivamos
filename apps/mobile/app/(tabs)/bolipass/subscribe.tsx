import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { apiClient } from "@/lib/api";

/**
 * Subscription purchase flow (PRD 4.2). No payment provider is integrated
 * yet — activating here just flips the BoliPass flag so the rest of the
 * redemption flow is testable end-to-end.
 */
export default function SubscribeScreen() {
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    setLoading(true);
    try {
      await apiClient.activateBoliPass();
      router.replace("/(tabs)/bolipass");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-bg-off-white p-8">
      <Text className="font-display text-3xl uppercase text-charcoal-dark">Get BoliPass</Text>
      <Text className="text-center text-muted-clay-gray">
        Buy 1, get 1 free at gastronomy, nightlife, and tour partners across Santa Cruz — all year.
      </Text>

      <View className="w-full rounded-lg bg-white p-6 shadow-md">
        <Text className="text-center font-display text-2xl text-boli-green">199 BOB / year</Text>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Pressable className="w-full rounded-lg bg-boli-orange p-4" onPress={subscribe}>
          <Text className="text-center text-lg text-white">Subscribe</Text>
        </Pressable>
      )}
    </View>
  );
}
