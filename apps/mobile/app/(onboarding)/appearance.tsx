import { View, Text, Pressable, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/use-theme";

export default function AppearanceScreen() {
  const { t } = useT();
  const { scheme, setScheme } = useTheme();
  const { categories } = useLocalSearchParams<{ categories?: string }>();

  function next() {
    router.push({ pathname: "/(onboarding)/privacy", params: { categories } });
  }

  return (
    <ScrollView className="flex-1 bg-bg-off-white dark:bg-dark-bg" contentContainerClassName="flex-grow p-6 pt-20">
      <Text className="font-display text-3xl leading-tight text-charcoal-dark dark:text-dark-ink">
        {t("dayOrNight")}
        {"\n"}
        <Text className="text-boli-orange">{t("nightQ")}</Text>
      </Text>
      <Text className="mb-6 mt-2 font-bold text-sm text-muted-clay-gray dark:text-dark-sub">{t("pickALook")}</Text>

      <View className="flex-row gap-3">
        {(["light", "dark"] as const).map((s) => {
          const active = scheme === s;
          return (
            <Pressable
              key={s}
              onPress={() => setScheme(s)}
              className="flex-1 overflow-hidden rounded-xl"
              style={{
                backgroundColor: s === "dark" ? "#1d1a17" : "#F4EEE2",
                shadowColor: "#000",
                elevation: 2,
              }}
            >
              <View
                className="p-4 pb-3"
                style={{ borderWidth: active ? 3 : 1.5, borderColor: active ? "#c4703d" : "rgba(122,106,82,.2)", borderRadius: 22 }}
              >
                <View style={{ height: 10, borderRadius: 999, backgroundColor: s === "dark" ? "#2b2723" : "#FDFAF3", marginBottom: 7 }} />
                <View style={{ height: 26, borderRadius: 10, backgroundColor: s === "dark" ? "#2b2723" : "#FDFAF3", marginBottom: 7 }} />
                <View style={{ width: "55%", height: 12, borderRadius: 999, backgroundColor: "#c4703d" }} />
                <View className="mt-3 flex-row items-center justify-center gap-2 py-2">
                  <Ionicons name={s === "dark" ? "moon" : "sunny"} size={16} color={s === "dark" ? "#f5ead8" : "#201e1d"} />
                  <Text className="font-bold" style={{ color: s === "dark" ? "#f5ead8" : "#201e1d" }}>
                    {s === "dark" ? t("dark") : t("light")}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1" />

      <Pressable className="w-full items-center rounded-pill bg-clay-terracotta py-4 shadow-clay active:translate-y-[3px]" onPress={next}>
        <Text className="font-bold text-white">{t("continueLabel")}</Text>
      </Pressable>
    </ScrollView>
  );
}
