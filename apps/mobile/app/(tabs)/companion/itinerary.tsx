import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import type { Category, ItineraryResponse } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";

const CATEGORY_LABELS: Record<Category, string> = {
  music: "Music",
  nightlife: "Nightlife / Clubs",
  gastronomy: "Gastronomy",
  historical: "Historical / Traditional",
  cultural: "Cultural",
};

export default function ItineraryScreen() {
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
    <ScrollView className="flex-1 bg-bg-off-white" contentContainerClassName="gap-4 p-6">
      <Text className="font-display text-2xl uppercase text-charcoal-dark">Plan my trip</Text>

      <View className="flex-row flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => {
          const active = selected.includes(category);
          return (
            <Pressable
              key={category}
              onPress={() => toggle(category)}
              className={`rounded-pill border px-4 py-2 ${active ? "border-boli-orange bg-boli-orange" : "border-muted-clay-gray"}`}
            >
              <Text className={active ? "text-white" : "text-charcoal-dark"}>{CATEGORY_LABELS[category]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center gap-3">
        <Text className="text-charcoal-dark">Days:</Text>
        {[1, 2, 3].map((d) => (
          <Pressable
            key={d}
            onPress={() => setDays(d)}
            className={`h-9 w-9 items-center justify-center rounded-full ${days === d ? "bg-boli-green" : "bg-white"}`}
          >
            <Text className={days === d ? "text-white" : "text-charcoal-dark"}>{d}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable className="rounded-lg bg-boli-green p-4" onPress={generate} disabled={loading}>
        <Text className="text-center text-lg text-white">Generate itinerary</Text>
      </Pressable>

      {loading && <ActivityIndicator />}

      {result?.days.map((day) => (
        <View key={day.label} className="gap-2">
          <Text className="font-display uppercase text-charcoal-dark">{day.label}</Text>
          {day.stops.map((stop, i) => (
            <View key={i} className="rounded-lg bg-white p-3 shadow-sm">
              <Text className="text-boli-green">{stop.time}</Text>
              <Text className="text-charcoal-dark">{stop.title}</Text>
              <Text className="text-muted-clay-gray">{stop.description}</Text>
              {stop.hasBoliPassOffer && <Text className="text-boli-orange">🎟️ BoliPass 2-for-1 here</Text>}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
