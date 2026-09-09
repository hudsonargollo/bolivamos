import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import type { Category, ItineraryResponse } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";
import { useT } from "@/lib/i18n";

const CATEGORY_LABELS: Record<Category, string> = {
  music: "Music",
  nightlife: "Nightlife / Clubs",
  gastronomy: "Gastronomy",
  historical: "Historical / Traditional",
  cultural: "Cultural",
};

export default function ItineraryScreen() {
  const { t } = useT();
  const [selected, setSelected] = useState<Category[]>([]);
  const [days, setDays] = useState(1);
  const [result, setResult] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(category: Category) {
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  async function generate() {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const itinerary = await apiClient.buildItinerary({ days, categories: selected });
      setResult(itinerary);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-bg-off-white dark:bg-dark-bg" contentContainerClassName="gap-4 p-6">
      <Text className="font-display text-2xl text-charcoal-dark dark:text-dark-ink">{t("planMyTrip")}</Text>

      <View className="flex-row flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => {
          const active = selected.includes(category);
          return (
            <Pressable
              key={category}
              onPress={() => toggle(category)}
              className={`rounded-pill border px-4 py-2 ${active ? "border-clay-terracotta bg-clay-terracotta shadow-clay" : "border-muted-clay-gray dark:border-dark-muted"}`}
            >
              <Text className={`font-bold ${active ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>{CATEGORY_LABELS[category]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center gap-3">
        <Text className="text-charcoal-dark dark:text-dark-ink">{t("daysLabel")}</Text>
        {[1, 2, 3].map((d) => (
          <Pressable
            key={d}
            onPress={() => setDays(d)}
            className={`h-9 w-9 items-center justify-center rounded-full ${days === d ? "bg-clay-terracotta shadow-clay" : "bg-white dark:bg-dark-card1"}`}
          >
            <Text className={`font-bold ${days === d ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>{d}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable className="rounded-pill bg-clay-terracotta p-4 shadow-clay active:translate-y-[3px]" onPress={generate} disabled={loading}>
        <Text className="text-center text-lg font-bold text-white">{t("generateItinerary")}</Text>
      </Pressable>

      {loading && <ActivityIndicator />}

      {result?.days.map((day) => (
        <View key={day.label} className="gap-2">
          <Text className="font-display text-charcoal-dark dark:text-dark-ink">{day.label}</Text>
          {day.stops.map((stop, i) => (
            <View key={i} className="rounded-xl bg-white p-3 shadow-clay dark:bg-dark-card1">
              <Text className="font-bold text-clay-terracotta">{stop.time}</Text>
              <Text className="text-charcoal-dark dark:text-dark-ink">{stop.title}</Text>
              <Text className="text-muted-clay-gray dark:text-dark-sub">{stop.description}</Text>
              {stop.hasBoliPassOffer && <Text className="text-clay-terracotta">{t("bolipassOfferHere")}</Text>}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
