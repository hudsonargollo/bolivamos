import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, ScrollView, Image, TextInput, Modal } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { EventDto, EventFilter } from "@bolivibes/api-schema";
import { apiClient, baseUrl } from "@/lib/api";
import { useT, type StringKey } from "@/lib/i18n";

const FILTERS: { key: EventFilter; labelKey: StringKey }[] = [
  { key: "today", labelKey: "filterToday" },
  { key: "tomorrow", labelKey: "filterTomorrow" },
  { key: "sunday", labelKey: "filterSunday" },
  { key: "weekend", labelKey: "filterWeekend" },
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
    <Pressable
      className="mb-3 overflow-hidden rounded-xl bg-white shadow-clay dark:bg-dark-card1"
      onPress={() => router.push(`/(tabs)/feed/${item.id}`)}
    >
      {image ? (
        <View>
          <Image source={image} className="h-36 w-full" resizeMode="cover" />
          <View className="absolute left-3 top-3 rounded-pill bg-clay-terracotta px-3 py-1 shadow-clay">
            <Text className="text-xs font-bold text-white">{eventTimeLabel(item.startTime)}</Text>
          </View>
        </View>
      ) : (
        <View className="h-16 w-full items-center justify-center bg-clay-terracotta/10">
          <Text className="font-display text-2xl text-clay-terracotta">{item.title.charAt(0)}</Text>
        </View>
      )}
      <View className="p-4">
        <View className="flex-row items-center gap-2">
          {!image ? <Text className="text-sm font-bold text-clay-terracotta">{eventTimeLabel(item.startTime)}</Text> : null}
          {item.category ? (
            <View className="rounded-pill bg-clay-sage/10 px-2 py-0.5">
              <Text className="text-xs font-bold text-clay-sage">{item.category}</Text>
            </View>
          ) : null}
          {item.isVipOnly ? (
            <View className="rounded-pill bg-charcoal-dark px-2 py-0.5">
              <Text className="text-xs font-bold text-white">VIP</Text>
            </View>
          ) : null}
          {item.featured ? (
            <View className="rounded-pill bg-boli-yellow px-2 py-0.5">
              <Text className="text-xs font-bold text-charcoal-dark">Featured</Text>
            </View>
          ) : null}
        </View>
        <Text className="mt-1 text-lg font-bold text-charcoal-dark dark:text-dark-ink">{item.title}</Text>
        {venueLine ? <Text className="mt-0.5 text-muted-clay-gray dark:text-dark-sub">{venueLine}</Text> : null}
      </View>
    </Pressable>
  );
}

export default function FeedScreen() {
  const { t } = useT();
  const [filter, setFilter] = useState<EventFilter>("today");
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    apiClient
      .listEvents(filter)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const availableCategories = useMemo(
    () => [...new Set(events.map((e) => e.category).filter((c): c is string => Boolean(c)))].sort(),
    [events],
  );

  const visibleEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (q && !e.title.toLowerCase().includes(q)) return false;
      if (categories.length > 0 && (!e.category || !categories.includes(e.category))) return false;
      return true;
    });
  }, [events, query, categories]);

  return (
    <View className="flex-1 bg-bg-off-white dark:bg-dark-bg">
      <View className="px-4 pb-3 pt-16">
        <Text className="font-display text-3xl leading-tight text-charcoal-dark dark:text-dark-ink">{t("happening")}</Text>
        <Text className="mt-1 font-bold text-sm text-muted-clay-gray dark:text-dark-sub">{t("whatToDoTagline")}</Text>
        <View className="mt-4 flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center gap-2 rounded-pill bg-white px-4 py-3 shadow-clay dark:bg-dark-card1">
            <Ionicons name="search" size={16} color="#7a6a52" />
            <TextInput
              className="flex-1 text-sm text-charcoal-dark dark:text-dark-ink"
              placeholder={t("searchPlaceholder")}
              placeholderTextColor="#7a6a52"
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-xl bg-white shadow-clay dark:bg-dark-card1"
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={19} color="#33302c" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="h-16 grow-0 px-4 py-3"
        contentContainerClassName="items-center gap-2"
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`rounded-pill px-4 py-2 ${filter === f.key ? "bg-clay-terracotta shadow-clay" : "bg-white dark:bg-dark-card1"}`}
          >
            <Text className={`font-bold ${filter === f.key ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>
              {t(f.labelKey)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text className="px-4 pt-2 font-display text-charcoal-dark dark:text-dark-ink">{t("placesToKnow")}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="h-32 grow-0 px-4 py-2"
        contentContainerClassName="items-center gap-3"
      >
        {PLACES_TO_KNOW.map((place) => (
          <View key={place} className="h-24 w-40 justify-end rounded-xl bg-white p-3 shadow-clay dark:bg-dark-card1">
            <Text className="text-charcoal-dark dark:text-dark-ink">{place}</Text>
          </View>
        ))}
      </ScrollView>

      <FlatList
        className="flex-1 px-4 pt-2"
        data={visibleEvents}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? <Text className="p-4 text-muted-clay-gray dark:text-dark-sub">{t("noEventsForFilter")}</Text> : null
        }
        renderItem={({ item }) => <EventCard item={item} />}
      />

      <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setShowFilters(false)} />
        <View className="rounded-t-sheet bg-bg-off-white p-6 pb-10 dark:bg-dark-bg">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-display text-2xl text-charcoal-dark dark:text-dark-ink">{t("filters")}</Text>
            <Pressable className="h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-dark-card1" onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={16} color="#33302c" />
            </Pressable>
          </View>
          <Text className="mb-2 font-bold text-xs uppercase tracking-wide text-muted-clay-gray dark:text-dark-sub">{t("category")}</Text>
          <View className="mb-5 flex-row flex-wrap gap-2">
            {availableCategories.length === 0 ? (
              <Text className="text-sm text-muted-clay-gray dark:text-dark-sub">{t("anyCategory")}</Text>
            ) : (
              availableCategories.map((c) => {
                const active = categories.includes(c);
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}
                    className={`rounded-pill border px-4 py-2 ${active ? "border-clay-terracotta bg-clay-terracotta shadow-clay" : "border-muted-clay-gray dark:border-dark-muted"}`}
                  >
                    <Text className={`font-bold text-sm ${active ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>{c}</Text>
                  </Pressable>
                );
              })
            )}
          </View>
          <Text className="mb-2 font-bold text-xs uppercase tracking-wide text-muted-clay-gray dark:text-dark-sub">{t("when")}</Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                className={`rounded-pill border px-4 py-2 ${filter === f.key ? "border-clay-terracotta bg-clay-terracotta shadow-clay" : "border-muted-clay-gray dark:border-dark-muted"}`}
              >
                <Text className={`font-bold text-sm ${filter === f.key ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>{t(f.labelKey)}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable className="w-full items-center rounded-pill bg-clay-terracotta py-4 shadow-clay active:translate-y-[3px]" onPress={() => setShowFilters(false)}>
            <Text className="font-bold text-white">
              {t("showResults")} ({visibleEvents.length})
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
