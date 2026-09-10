import { useState } from "react";
import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useT, type StringKey } from "@/lib/i18n";
import { setDefaultVisibility, type DefaultVisibility } from "@/lib/privacy-prefs";

const ONBOARDED_KEY = "bolivibes-onboarded";

const OPTIONS: { key: DefaultVisibility; icon: keyof typeof Ionicons.glyphMap; titleKey: StringKey; bodyKey: StringKey }[] = [
  { key: "everyone", icon: "eye-outline", titleKey: "visEveryoneTitle", bodyKey: "visEveryoneBody" },
  { key: "friends", icon: "people-outline", titleKey: "visFriendsTitle", bodyKey: "visFriendsBody" },
  { key: "ghost", icon: "eye-off-outline", titleKey: "visGhostTitle", bodyKey: "visGhostBody" },
];

export default function PrivacyScreen() {
  const { t } = useT();
  const { categories } = useLocalSearchParams<{ categories?: string }>();
  const [vis, setVis] = useState<DefaultVisibility>("friends");
  const [sharePlans, setSharePlans] = useState(true);

  async function finish() {
    await setDefaultVisibility(vis);
    await SecureStore.setItemAsync(ONBOARDED_KEY, "1");
    router.push({ pathname: "/(auth)/login", params: { categories } });
  }

  return (
    <ScrollView className="flex-1 bg-bg-off-white dark:bg-dark-bg" contentContainerClassName="flex-grow p-6 pt-16">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-xl bg-clay-terracotta/14">
        <Ionicons name="shield-checkmark-outline" size={26} color="#8f4225" />
      </View>
      <Text className="font-display text-3xl leading-tight text-charcoal-dark dark:text-dark-ink">
        {t("yourNight")}
        {"\n"}
        <Text className="text-boli-orange">{t("yourPrivacy")}</Text>
      </Text>
      <Text className="mb-5 mt-2 font-bold text-sm text-muted-clay-gray dark:text-dark-sub">{t("privacyIntro")}</Text>

      <View className="mb-4 gap-2">
        {OPTIONS.map((o) => {
          const active = vis === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => setVis(o.key)}
              className={`flex-row items-center gap-3 rounded-xl bg-white p-4 dark:bg-dark-card1 ${active ? "shadow-clay" : "shadow-sm"}`}
              style={active ? { borderWidth: 2, borderColor: "#c4703d" } : undefined}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: active ? "#c4703d" : "rgba(196,112,61,.14)" }}
              >
                <Ionicons name={o.icon} size={19} color={active ? "#fff" : "#8f4225"} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t(o.titleKey)}</Text>
                <Text className="mt-0.5 text-xs font-semibold text-muted-clay-gray dark:text-dark-sub">{t(o.bodyKey)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-dark-card1">
        <View className="flex-1">
          <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t("sharePlans")}</Text>
          <Text className="mt-0.5 text-xs font-semibold text-muted-clay-gray dark:text-dark-sub">{t("sharePlansBody")}</Text>
        </View>
        <Switch value={sharePlans} onValueChange={setSharePlans} trackColor={{ true: "#7a8a5e" }} thumbColor="#f7f1e4" />
      </View>

      <View className="flex-1" />

      <Pressable className="mt-4 w-full items-center rounded-pill bg-clay-terracotta py-4 shadow-clay active:translate-y-[3px]" onPress={finish}>
        <Text className="font-bold text-white">{t("startExploring")}</Text>
      </Pressable>
    </ScrollView>
  );
}
