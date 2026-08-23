import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ScrollView, Image } from "react-native";
import type { EventDto, EventFilter } from "@bolivamos/api-schema";
import { apiClient, baseUrl } from "@/lib/api";

const FILTERS: { key: EventFilter; label: string }[] = [
  { key: "today", label: "TODAY" },
  { key: "tomorrow", label: "TOMORROW" },
  { key: "sunday", label: "SUNDAY" },
  { key: "weekend", label: "THIS WEEKEND" },
];

// Static placeholder — a real "Places To Know" carousel needs a curated
// venues endpoint/field the current schema doesn't distinguish yet.
const PLACES_TO_KNOW = ["Casco Viejo", "Parque Urbano Lomas de Arena", "La Recoleta"];

function eventImageSource(imageUrl: string | null) {
  if (!imageUrl) return null;
  return { uri: imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}` };
}

function eventTimeLabel(startTime: string) {
  const m = /T(\d{2}):(\d{2})/.exec(startTime);
  return m ? `${m[1]}:${m[2]}` : "TBA";
}

function EventCard({ item }: { item: EventDto }) {
  const image = eventImageSource(item.imageUrl);
  const venueLine = [item.venueName, item.isFree ? "Gratis" : item.priceText].filter(Boolean).join(" · ");

  return (
    <View className="mb-3 overflow-hidden rounded-lg bg-white shadow-sm">
      {image ? (
        <Image source={image} className="h-36 w-full" resizeMode="cover" />
      ) : (
        <View className="h-16 w-full items-center justify-center bg-boli-green/10">
          <Text className="font-display text-2xl text-boli-green">{item.title.charAt(0)}</Text>
        </View>
      )}
      <View className="p-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-bold text-boli-orange">{eventTimeLabel(item.startTime)}</Text>
          {item.category ? (
            <View className="rounded-pill bg-boli-green/10 px-2 py-0.5">
              <Text className="text-xs font-bold text-boli-green">{item.category}</Text>
            </View>
          ) : null}
        </View>
        <Text className="mt-1 text-lg font-bold text-charcoal-dark">{item.title}</Text>
        {venueLine ? <Text className="mt-0.5 text-muted-clay-gray">{venueLine}</Text> : null}
      </View>
    </View>
  );
}

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
      <View className="bg-charcoal-dark px-4 pb-5 pt-16">
        <Text className="font-display text-3xl uppercase">
          <Text className="text-bg-off-white">BOLI</Text>
          <Text className="text-boli-orange">VAMOS</Text>
          <Text className="text-boli-red">!</Text>
        </Text>
        <Text className="mt-1 text-muted-clay-gray">What to do in Santa Cruz de la Sierra</Text>
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
        className="flex-1 px-4 pt-2"
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? <Text className="p-4 text-muted-clay-gray">No events for this filter yet.</Text> : null
        }
        renderItem={({ item }) => <EventCard item={item} />}
      />
    </View>
  );
}
