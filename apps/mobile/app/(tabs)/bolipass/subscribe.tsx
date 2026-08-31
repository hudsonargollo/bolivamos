import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { apiClient } from "@/lib/api";

const FULL_PRICE_USD = 50;
const BOLIVIAN_DISCOUNT_PRICE_USD = 25;
// Mirrors the server-side check in
// apps/web/app/api/subscriptions/bolipass/checkout/route.ts — a format
// check only, not identity verification.
const NIT_FORMAT = /^\d{7,13}$/;

export default function SubscribeScreen() {
  const [nit, setNit] = useState("");
  const [loading, setLoading] = useState(false);

  const nitFormatValid = NIT_FORMAT.test(nit);
  const priceUsd = nitFormatValid ? BOLIVIAN_DISCOUNT_PRICE_USD : FULL_PRICE_USD;

  async function subscribe() {
    setLoading(true);
    try {
      const { checkoutUrl } = await apiClient.startBoliPassCheckout({ nit: nit || undefined });
      await WebBrowser.openBrowserAsync(checkoutUrl);
      router.replace("/(tabs)/bolipass");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-bg-off-white p-8">
      <Text className="font-display text-3xl uppercase text-charcoal-dark">Get BoliPass</Text>
      <Text className="text-center text-muted-clay-gray">
        Buy 1, get 1 free at gastronomy, nightlife, and tour partners across Santa Cruz — renews
        automatically every 3 months.
      </Text>

      <View className="w-full rounded-lg bg-white p-6 shadow-md">
        <Text className="text-center font-display text-2xl text-boli-green">
          ${priceUsd} / 3 months
        </Text>
        {nitFormatValid ? (
          <Text className="mt-1 text-center text-muted-clay-gray">Bolivian discount applied</Text>
        ) : null}
      </View>

      <View className="w-full">
        <Text className="mb-1 text-muted-clay-gray">NIT (optional — 50% off for Bolivians)</Text>
        <TextInput
          className="w-full rounded-lg bg-white p-3"
          placeholder="e.g. 1234567"
          keyboardType="number-pad"
          value={nit}
          onChangeText={setNit}
        />
        {nit.length > 0 && !nitFormatValid ? (
          <Text className="mt-1 text-boli-red">Doesn&rsquo;t look like a valid NIT — full price applies.</Text>
        ) : (
          <Text className="mt-1 text-xs text-muted-clay-gray">
            Self-reported, format-checked only — not identity verification.
          </Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Pressable className="w-full rounded-lg bg-boli-red p-4" onPress={subscribe}>
          <Text className="text-center text-lg text-white">Subscribe</Text>
        </Pressable>
      )}
    </View>
  );
}
