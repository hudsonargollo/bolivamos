import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import type { Category } from "@bolivamos/api-schema";
import { useT } from "@/lib/i18n";

const CATEGORY_LABELS: Record<Category, string> = {
  music: "Music",
  nightlife: "Nightlife / Clubs",
  gastronomy: "Gastronomy",
  historical: "Historical / Traditional",
  cultural: "Cultural",
};

export default function PreferencesScreen() {
  const { t } = useT();
  const [selected, setSelected] = useState<Category[]>([]);

  function toggle(category: Category) {
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  function next() {
    router.push({ pathname: "/(onboarding)/appearance", params: { categories: selected.join(",") } });
  }

  return (
    <ScrollView className="flex-1 bg-bg-off-white dark:bg-dark-bg" contentContainerClassName="flex-grow p-6 pt-20">
      <Text className="font-display text-3xl leading-tight text-charcoal-dark dark:text-dark-ink">
        {t("whatGetsYouOut")}
        {"\n"}
        <Text className="text-boli-orange">{t("outAtNight")}</Text>
      </Text>
      <Text className="mb-6 mt-2 font-bold text-sm text-muted-clay-gray dark:text-dark-sub">{t("pickAFewFeedIntro")}</Text>

      <View className="flex-row flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => {
          const active = selected.includes(category);
          return (
            <Pressable
              key={category}
              onPress={() => toggle(category)}
              className={`rounded-pill border px-4 py-3 ${active ? "border-clay-terracotta bg-clay-terracotta shadow-clay" : "border-muted-clay-gray dark:border-dark-muted"}`}
            >
              <Text className={`font-bold text-sm ${active ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>
                {CATEGORY_LABELS[category]}
              </Text>
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
