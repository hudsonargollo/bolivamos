import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { EventDto, AttendeeDto, AuthUser } from "@bolivibes/api-schema";
import { apiClient, baseUrl } from "@/lib/api";
import { useT } from "@/lib/i18n";

function eventImageSource(imageUrl: string | null) {
  if (!imageUrl) return null;
  return { uri: imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}` };
}

function eventDateTimeLabel(startTime: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(startTime);
  if (!m) return startTime;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  const day = date.toLocaleDateString("es-BO", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return m[4] ? `${day} · ${m[4]}:${m[5]}` : day;
}

export default function EventDetailScreen() {
  const { t } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [me, setMe] = useState<AuthUser | null>(null);
  const [visible, setVisible] = useState(false);
  const [attendees, setAttendees] = useState<AttendeeDto[]>([]);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    apiClient.getEvent(id).then(setEvent).catch(() => setEvent(null));
    apiClient.getMe().then(setMe).catch(() => setMe(null));
  }, [id]);

  const loadAttendees = useCallback(() => {
    apiClient
      .getEventAttendees(id)
      .then(setAttendees)
      .catch(() => setAttendees([]));
  }, [id]);

  useEffect(() => {
    if (me?.isBoliPassActive) loadAttendees();
  }, [me, loadAttendees]);

  async function toggleVisible() {
    const next = !visible;
    setVisible(next);
    try {
      await apiClient.setEventAttendance(id, { visible: next });
    } catch {
      setVisible(!next);
    }
  }

  async function connect(toUserId: string) {
    try {
      await apiClient.sendConnectRequest({ eventId: id, toUserId });
      setSentTo((prev) => new Set(prev).add(toUserId));
    } catch {
      // no-op — button just stays enabled if it failed
    }
  }

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-off-white dark:bg-dark-bg">
        <ActivityIndicator />
      </View>
    );
  }

  const image = eventImageSource(event.imageUrl);
  const venueLine = [event.venueName, event.district].filter(Boolean).join(" · ");
  const tags = [event.category, event.isFree ? t("free") : null, event.isVipOnly ? "VIP" : null].filter(
    (x): x is string => Boolean(x),
  );

  return (
    <ScrollView className="flex-1 bg-bg-off-white dark:bg-dark-bg" bounces={false}>
      <View style={{ height: 300 }}>
        {image ? (
          <Image source={image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <View className="h-full items-center justify-center" style={{ backgroundColor: "#232840" }}>
            <Text className="font-display text-5xl text-white/60">{event.title.charAt(0)}</Text>
          </View>
        )}
        <LinearGradient
          colors={["rgba(20,18,16,0)", "rgba(244,238,226,0.98)"]}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 160 }}
        />
        <Pressable
          className="absolute left-4 top-14 h-9 w-9 items-center justify-center rounded-xl bg-white/90 shadow-clay"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={18} color="#33302c" />
        </Pressable>
        <View className="absolute bottom-3 left-5 rounded-pill bg-clay-terracotta px-4 py-1.5 shadow-clay">
          <Text className="text-xs font-bold text-white">{eventDateTimeLabel(event.startTime)}</Text>
        </View>
      </View>

      <View className="px-5 pb-8 pt-1">
        <Text className="font-display text-3xl leading-tight text-charcoal-dark dark:text-dark-ink">{event.title}</Text>
        {venueLine ? <Text className="mt-1 font-bold text-sm text-muted-clay-gray dark:text-dark-sub">{venueLine}</Text> : null}

        {tags.length > 0 && (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <View key={tag} className="rounded-pill bg-clay-sage/12 px-3 py-1.5">
                <Text className="text-xs font-bold text-clay-sage-dk">{tag}</Text>
              </View>
            ))}
            {event.priceText && !event.isFree ? (
              <View className="rounded-pill bg-boli-yellow/20 px-3 py-1.5">
                <Text className="text-xs font-bold text-charcoal-dark dark:text-dark-ink">{event.priceText}</Text>
              </View>
            ) : null}
          </View>
        )}

        {event.description ? (
          <View className="mt-4 rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1">
            <Text className="mb-1 font-display text-base text-charcoal-dark dark:text-dark-ink">About</Text>
            <Text className="text-sm leading-6 text-muted-clay-gray dark:text-dark-sub">{event.description}</Text>
          </View>
        ) : null}

        {/* VIP Connect — who's going */}
        <View className="mt-3 rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1">
          <Text className="mb-2 font-display text-base text-charcoal-dark dark:text-dark-ink">{t("whosGoing")}</Text>
          {!me?.isBoliPassActive ? (
            <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t("bolipassMembersCanSee")}</Text>
          ) : (
            <>
              <Pressable className="flex-row items-center gap-2" onPress={toggleVisible}>
                <View className={`h-5 w-5 rounded border ${visible ? "bg-clay-sage" : "bg-white"} border-clay-sage`} />
                <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t("imGoingShowMe")}</Text>
              </Pressable>

              {attendees.length > 0 && (
                <View className="mt-3 gap-2">
                  {attendees.map((a) => (
                    <View key={a.userId} className="flex-row items-center justify-between">
                      <Text className="text-charcoal-dark dark:text-dark-ink">{a.fullName ?? "A fellow VIP member"}</Text>
                      <Pressable
                        className={`rounded-pill px-4 py-2 ${sentTo.has(a.userId) ? "bg-clay-sage/15" : "bg-clay-terracotta shadow-clay"}`}
                        onPress={() => connect(a.userId)}
                        disabled={sentTo.has(a.userId)}
                      >
                        <Text className={`font-bold text-xs ${sentTo.has(a.userId) ? "text-clay-sage-dk" : "text-white"}`}>
                          {sentTo.has(a.userId) ? t("requestSent") : t("connect")}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
              <Pressable className="mt-3 self-start" onPress={() => router.push("/connect")}>
                <Text className="font-bold text-xs text-clay-sage-dk">{t("goToConnectInbox")}</Text>
              </Pressable>
            </>
          )}
        </View>

        {event.mapsUrl ? (
          <View className="mt-3 rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1">
            <Text className="mb-2 font-display text-base text-charcoal-dark dark:text-dark-ink">{t("gettingThere")}</Text>
            <Pressable
              className="flex-row items-center justify-center gap-2 rounded-pill bg-clay-terracotta/14 py-3"
              onPress={() => Linking.openURL(event.mapsUrl!)}
            >
              <Ionicons name="navigate-outline" size={16} color="#8f4225" />
              <Text className="font-bold text-clay-terracotta-dk">{t("openInGoogleMaps")}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
