import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import type { Category } from "@bolivamos/api-schema";

const CATEGORY_LABELS: Record<Category, string> = {
  music: "Music",
  nightlife: "Nightlife / Clubs",
  gastronomy: "Gastronomy",
  historical: "Historical / Traditional",
  cultural: "Cultural",
};

export default function PreferencesScreen() {
  const [selected, setSelected] = useState<Category[]>([]);

  function toggle(category: Category) {
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  function continueToLogin() {
    router.push({ pathname: "/(auth)/login", params: { categories: selected.join(",") } });
  }

  return (
    <ScrollView className="flex-1 bg-bg-off-white" contentContainerClassName="items-center gap-4 p-8">
      <Text className="font-display text-2xl uppercase text-charcoal-dark">What do you love?</Text>
      <Text className="text-center text-muted-clay-gray">Pick a few — we'll tailor your feed.</Text>

      <View className="w-full gap-3">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => {
          const active = selected.includes(category);
          return (
            <Pressable
              key={category}
              onPress={() => toggle(category)}
              className={`rounded-pill border p-4 ${active ? "border-boli-orange bg-boli-orange" : "border-muted-clay-gray"}`}
            >
              <Text className={`text-center ${active ? "text-white" : "text-charcoal-dark"}`}>
                {CATEGORY_LABELS[category]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable className="mt-4 w-full rounded-lg bg-boli-green p-4" onPress={continueToLogin}>
        <Text className="text-center text-lg text-white">Continue</Text>
      </Pressable>
    </ScrollView>
  );
}
