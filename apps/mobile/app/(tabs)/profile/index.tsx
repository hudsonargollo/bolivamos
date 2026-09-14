import { useEffect, useState, type ReactNode } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "@bolivibes/api-schema";
import { apiClient } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useT, type Locale } from "@/lib/i18n";
import { useTheme } from "@/lib/use-theme";

const ONBOARDED_KEY = "bolivibes-onboarded";
type IconName = keyof typeof Ionicons.glyphMap;

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="min-h-11 flex-row overflow-hidden rounded-pill bg-bg-off-white p-1 dark:bg-dark-bg2">
      {options.map((o) => {
        const selected = value === o.key;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.key)}
            className={`min-h-9 flex-1 items-center justify-center rounded-pill px-3 ${selected ? "bg-clay-terracotta shadow-clay" : ""}`}
          >
            <Text className={`text-xs font-bold ${selected ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="px-1 text-xs font-extrabold uppercase tracking-[1.4px] text-muted-clay-gray dark:text-dark-sub">{title}</Text>
      <View className="overflow-hidden rounded-[24px] bg-white shadow-clay dark:bg-dark-card1">{children}</View>
    </View>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  badge,
  disabled,
  iconColor,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  badge?: string;
  disabled?: boolean;
  iconColor: string;
}) {
  const content = (
    <>
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-clay-terracotta/12 dark:bg-white/10">
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-xs font-semibold leading-4 text-muted-clay-gray dark:text-dark-sub">{subtitle}</Text> : null}
      </View>
      {badge ? (
        <View className="rounded-pill bg-muted-clay-gray/20 px-2.5 py-1 dark:bg-white/10">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-muted-clay-gray dark:text-dark-sub">{badge}</Text>
        </View>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={16} color="#9a8a6e" />
      ) : null}
    </>
  );

  if (onPress && !disabled) {
    return (
      <Pressable
        accessibilityRole="button"
        className="min-h-[64px] flex-row items-center gap-3 border-b border-bg-off-white px-4 py-3 active:bg-bg-off-white/70 dark:border-dark-bg2 dark:active:bg-dark-bg2"
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className={`min-h-[64px] flex-row items-center gap-3 border-b border-bg-off-white px-4 py-3 dark:border-dark-bg2 ${disabled ? "opacity-65" : ""}`}>
      {content}
    </View>
  );
}

export default function ProfileScreen() {
  const { t, locale, setLocale } = useT();
  const { scheme, setScheme } = useTheme();
  const [me, setMe] = useState<AuthUser | null>(null);
  const dark = scheme === "dark";
  const iconColor = dark ? "#E9DDC7" : "#33302c";

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
  const vip = Boolean(me?.isBoliPassActive);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-off-white dark:bg-dark-bg">
      <ScrollView contentContainerClassName="gap-5 px-5 pb-10 pt-4" showsVerticalScrollIndicator={false}>
        <View className="rounded-[28px] bg-charcoal-dark p-5 shadow-clay dark:bg-dark-bg2">
          <View className="flex-row items-start gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-clay-terracotta shadow-clay">
              <Text className="font-display text-xl text-white">{initials || "—"}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-display text-2xl text-white">{name || t("tabProfile")}</Text>
              <View className={`mt-3 self-start rounded-pill px-3 py-1.5 ${vip ? "bg-clay-sage" : "bg-white/15"}`}>
                <Text className="text-xs font-extrabold uppercase tracking-wide text-white">
                  {vip ? t("vipMember") : t("freePlan")}
                </Text>
              </View>
            </View>
          </View>
          <Text className="mt-4 text-sm font-semibold leading-5 text-white/75">
            {vip ? `${t("tabBolipass")}: ${t("bolipassActive")}` : `${t("tabBolipass")}: ${t("bolipassNotSubscribed")}`}
          </Text>
          {!vip && (
            <Pressable
              accessibilityRole="button"
              className="mt-4 min-h-11 items-center justify-center rounded-pill bg-clay-terracotta px-4 shadow-clay active:opacity-90"
              onPress={() => router.push("/(tabs)/bolipass")}
            >
              <Text className="font-bold text-white">{t("upgradeToActivate")}</Text>
            </Pressable>
          )}
        </View>

        <Section title="Config">
          <View className="gap-3 border-b border-bg-off-white px-4 py-4 dark:border-dark-bg2">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-clay-terracotta/12 dark:bg-white/10">
                  <Ionicons name="contrast-outline" size={19} color={iconColor} />
                </View>
                <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t("appearance")}</Text>
              </View>
              <View className="w-[136px]">
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
          </View>

          <View className="gap-3 px-4 py-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-clay-terracotta/12 dark:bg-white/10">
                  <Ionicons name="language-outline" size={19} color={iconColor} />
                </View>
                <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t("language")}</Text>
              </View>
              <View className="w-[116px]">
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
          </View>
        </Section>

        <Section title="Account">
          <Row icon="ticket-outline" title={t("marketplaceTitle")} subtitle={t("marketplaceSub")} onPress={() => router.push("/marketplace")} iconColor={iconColor} />
          {vip && <Row icon="people-outline" title={t("myConnections")} subtitle={t("connectSub")} onPress={() => router.push("/connect")} iconColor={iconColor} />}
          <Row icon="receipt-outline" title={t("myTickets")} badge={t("comingSoon")} disabled iconColor={iconColor} />
          <Row icon="heart-outline" title={t("savedEvents")} badge={t("comingSoon")} disabled iconColor={iconColor} />
        </Section>

        <View className="gap-3">
          <Pressable accessibilityRole="button" className="min-h-12 items-center justify-center rounded-pill bg-white px-4 shadow-sm active:bg-bg-off-white/70 dark:bg-dark-card1 dark:active:bg-dark-bg2" onPress={replayOnboarding}>
            <Text className="font-bold text-xs text-muted-clay-gray dark:text-dark-sub">{t("replayOnboarding")}</Text>
          </Pressable>

          <Pressable accessibilityRole="button" className="min-h-12 items-center justify-center rounded-pill border border-clay-danger px-4 active:bg-clay-danger/10" onPress={logout}>
            <Text className="text-center font-bold text-clay-danger">{t("logout")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
