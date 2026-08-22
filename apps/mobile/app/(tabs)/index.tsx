import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ScrollView } from "react-native";
import type { EventDto, EventFilter } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";

const FILTERS: { key: EventFilter; label: string }[] = [
  { key: "today", label: "TODAY" },
  { key: "tomorrow", label: "TOMORROW" },
  { key: "sunday", label: "SUNDAY" },
  { key: "weekend", label: "THIS WEEKEND" },
];

// Static placeholder — a real "Places To Know" carousel needs a curated
// venues endpoint/field the current schema doesn't distinguish yet.
const PLACES_TO_KNOW = ["Casco Viejo", "Parque Urbano Lomas de Arena", "La Recoleta"];

export default function FeedScreen() {
  const [filter, setFilter] = useState<EventFilter>("today");
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient
      .listEvents(filter)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <View className="flex-1 bg-bg-off-white">
      <View className="bg-boli-green px-4 pb-4 pt-16">
        <Text className="font-display text-2xl uppercase text-white">What to do in Santa Cruz</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3" contentContainerClassName="gap-2">
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`rounded-pill px-4 py-2 ${filter === f.key ? "bg-boli-orange" : "bg-white"}`}
          >
            <Text className={filter === f.key ? "text-white" : "text-charcoal-dark"}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text className="px-4 pt-2 font-display uppercase text-charcoal-dark">Places To Know</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2" contentContainerClassName="gap-3">
        {PLACES_TO_KNOW.map((place) => (
          <View key={place} className="h-24 w-40 justify-end rounded-lg bg-white p-3 shadow-sm">
            <Text className="text-charcoal-dark">{place}</Text>
          </View>
        ))}
      </ScrollView>

      <FlatList
        className="flex-1 px-4"
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? <Text className="p-4 text-muted-clay-gray">No events for this filter yet.</Text> : null
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
            <Text className="text-lg text-charcoal-dark">{item.title}</Text>
            {item.description ? <Text className="text-muted-clay-gray">{item.description}</Text> : null}
            <Text className="mt-1 text-sm text-boli-green">{new Date(item.startTime).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
