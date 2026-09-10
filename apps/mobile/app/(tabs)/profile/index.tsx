import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "@bolivibes/api-schema";
import { apiClient } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useT, type Locale } from "@/lib/i18n";
import { useTheme } from "@/lib/use-theme";

const ONBOARDED_KEY = "bolivibes-onboarded";

function Segmented<T extends string>({ options, value, onChange }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View className="flex-row overflow-hidden rounded-pill bg-bg-off-white p-1 dark:bg-dark-bg2">
      {options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => onChange(o.key)}
          className={`flex-1 items-center rounded-pill py-2 ${value === o.key ? "bg-clay-terracotta shadow-clay" : ""}`}
        >
          <Text className={`text-xs font-bold ${value === o.key ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const { t, locale, setLocale } = useT();
  const { scheme, setScheme } = useTheme();
  const [me, setMe] = useState<AuthUser | null>(null);

  useEffect(() => {
    apiClient.getMe().then(setMe).catch(() => setMe(null));
  }, []);

  async function logout() {
    await apiClient.logout().catch(() => undefined);
    await clearToken();
    router.replace("/(onboarding)/preferences");
  }

  async function replayOnboarding() {
    await SecureStore.deleteItemAsync(ONBOARDED_KEY);
    router.replace("/(onboarding)");
  }

  const name = me?.fullName ?? me?.email ?? "";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <ScrollView className="flex-1 bg-bg-off-white dark:bg-dark-bg" contentContainerClassName="gap-3 p-6 pt-16">
      <View className="mb-2 flex-row items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-clay-terracotta shadow-clay">
          <Text className="font-display text-lg text-white">{initials || "—"}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-display text-xl text-charcoal-dark dark:text-dark-ink">{name || t("tabProfile")}</Text>
          <Text className="mt-0.5 text-xs font-bold text-muted-clay-gray dark:text-dark-sub">
            {t("tabBolipass")}: {me?.isBoliPassActive ? t("bolipassActive") : t("bolipassNotSubscribed")}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1">
        <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t("appearance")}</Text>
        <View style={{ width: 120 }}>
          <Segmented
            options={[
              { key: "light", label: t("light") },
              { key: "dark", label: t("dark") },
            ]}
            value={scheme}
            onChange={setScheme}
          />
        </View>
      </View>

      <View className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1">
        <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t("language")}</Text>
        <View style={{ width: 100 }}>
          <Segmented<Locale>
            options={[
              { key: "es", label: "ES" },
              { key: "en", label: "EN" },
            ]}
            value={locale}
            onChange={setLocale}
          />
        </View>
      </View>

      <Pressable className="flex-row items-center gap-3 rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1" onPress={() => router.push("/marketplace")}>
        <Ionicons name="ticket-outline" size={17} color="#33302c" />
        <View className="flex-1">
          <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t("marketplaceTitle")}</Text>
          <Text className="text-xs font-semibold text-muted-clay-gray dark:text-dark-sub">{t("marketplaceSub")}</Text>
        </View>
        <Ionicons name="chevron-forward" size={15} color="#9a8a6e" />
      </Pressable>

      {me?.isBoliPassActive && (
        <Pressable className="flex-row items-center gap-3 rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1" onPress={() => router.push("/connect")}>
          <Ionicons name="people-outline" size={17} color="#33302c" />
          <View className="flex-1">
            <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t("myConnections")}</Text>
            <Text className="text-xs font-semibold text-muted-clay-gray dark:text-dark-sub">{t("connectSub")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={15} color="#9a8a6e" />
        </Pressable>
      )}

      {([
        { icon: "receipt-outline" as const, label: t("myTickets") },
        { icon: "heart-outline" as const, label: t("savedEvents") },
      ]).map((row) => (
        <View key={row.label} className="flex-row items-center gap-3 rounded-xl bg-white p-4 opacity-60 shadow-sm dark:bg-dark-card1">
          <Ionicons name={row.icon} size={17} color="#33302c" />
          <Text className="flex-1 font-bold text-sm text-charcoal-dark dark:text-dark-ink">{row.label}</Text>
          <View className="rounded-pill bg-muted-clay-gray/20 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-muted-clay-gray dark:text-dark-sub">{t("comingSoon")}</Text>
          </View>
        </View>
      ))}

      <Pressable className="mt-2 items-center rounded-pill bg-white p-3 shadow-sm dark:bg-dark-card1" onPress={replayOnboarding}>
        <Text className="font-bold text-xs text-muted-clay-gray dark:text-dark-sub">{t("replayOnboarding")}</Text>
      </Pressable>

      <Pressable className="mt-1 items-center rounded-pill border border-clay-danger p-4" onPress={logout}>
        <Text className="text-center font-bold text-clay-danger">{t("logout")}</Text>
      </Pressable>
    </ScrollView>
  );
}
