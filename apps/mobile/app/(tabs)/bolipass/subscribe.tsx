import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { apiClient } from "@/lib/api";
import { useT } from "@/lib/i18n";

const FULL_PRICE_USD = 50;
const BOLIVIAN_DISCOUNT_PRICE_USD = 25;
// Mirrors the server-side check in
// apps/web/app/api/subscriptions/bolipass/checkout/route.ts — a format
// check only, not identity verification.
const NIT_FORMAT = /^\d{7,13}$/;

export default function SubscribeScreen() {
  const { t } = useT();
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
    <View className="flex-1 items-center justify-center gap-6 bg-bg-off-white p-8 dark:bg-dark-bg">
      <Text className="font-display text-3xl text-charcoal-dark dark:text-dark-ink">{t("getBolipass")}</Text>
      <Text className="text-center text-muted-clay-gray dark:text-dark-sub">{t("getBolipassTagline")}</Text>

      <View className="w-full rounded-xl bg-white p-6 shadow-clay dark:bg-dark-card1">
        <Text className="text-center font-display text-2xl text-clay-terracotta">
          ${priceUsd} {t("perThreeMonths")}
        </Text>
        {nitFormatValid ? (
          <Text className="mt-1 text-center text-muted-clay-gray dark:text-dark-sub">{t("bolivianDiscountApplied")}</Text>
        ) : null}
      </View>

      <View className="w-full">
        <Text className="mb-1 text-muted-clay-gray dark:text-dark-sub">{t("nitLabel")}</Text>
        <TextInput
          className="w-full rounded-xl bg-white p-3 dark:bg-dark-card1 dark:text-dark-ink"
          placeholder="e.g. 1234567"
          keyboardType="number-pad"
          value={nit}
          onChangeText={setNit}
        />
        {nit.length > 0 && !nitFormatValid ? (
          <Text className="mt-1 text-clay-danger">{t("nitInvalid")}</Text>
        ) : (
          <Text className="mt-1 text-xs text-muted-clay-gray dark:text-dark-sub">{t("nitDisclaimer")}</Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Pressable className="w-full rounded-pill bg-clay-terracotta p-4 shadow-clay active:translate-y-[3px]" onPress={subscribe}>
          <Text className="text-center text-lg font-bold text-white">{t("subscribe")}</Text>
        </Pressable>
      )}
    </View>
  );
}
