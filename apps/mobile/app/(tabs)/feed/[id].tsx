import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import type { EventDto, AttendeeDto, AuthUser } from "@bolivamos/api-schema";
import { apiClient, baseUrl } from "@/lib/api";

function eventImageSource(imageUrl: string | null) {
  if (!imageUrl) return null;
  return { uri: imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}` };
}

export default function EventDetailScreen() {
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
      <View className="flex-1 items-center justify-center bg-bg-off-white">
        <ActivityIndicator />
      </View>
    );
  }

  const image = eventImageSource(event.imageUrl);
  const venueLine = [event.venueName, event.district].filter(Boolean).join(" · ");

  return (
    <ScrollView className="flex-1 bg-bg-off-white">
      {image && <Image source={image} className="h-52 w-full" resizeMode="cover" />}
      <View className="gap-3 p-5">
        {event.category ? <Text className="font-bold text-boli-orange">{event.category}</Text> : null}
        <Text className="font-display text-2xl uppercase text-charcoal-dark">{event.title}</Text>
        {venueLine ? <Text className="text-muted-clay-gray">{venueLine}</Text> : null}
        {(event.priceText || event.isFree) && (
          <Text className="font-bold text-charcoal-dark">{event.isFree ? "Gratis" : event.priceText}</Text>
        )}
        {event.description ? <Text className="leading-6 text-charcoal-dark">{event.description}</Text> : null}

        {event.mapsUrl ? (
          <Pressable
            className="self-start rounded-pill bg-boli-green/10 px-4 py-2"
            onPress={() => Linking.openURL(event.mapsUrl!)}
          >
            <Text className="font-bold text-boli-green">Open in Google Maps</Text>
          </Pressable>
        ) : null}

        {/* VIP Connect */}
        {!me?.isBoliPassActive ? (
          <View className="mt-2 rounded-lg bg-white p-4 shadow-sm">
            <Text className="font-bold text-charcoal-dark">
              🔒 BoliPass members can see who else is going and connect — subscribe to unlock.
            </Text>
          </View>
        ) : (
          <View className="mt-2 rounded-lg bg-white p-4 shadow-sm">
            <Pressable className="flex-row items-center gap-2" onPress={toggleVisible}>
              <View className={`h-5 w-5 rounded border ${visible ? "bg-boli-green" : "bg-white"} border-boli-green`} />
              <Text className="font-bold text-charcoal-dark">I&rsquo;m going — show me to other VIP members</Text>
            </Pressable>

            {attendees.length > 0 && (
              <View className="mt-3 gap-2">
                {attendees.map((a) => (
                  <View key={a.userId} className="flex-row items-center justify-between">
                    <Text className="text-charcoal-dark">{a.fullName ?? "A fellow VIP member"}</Text>
                    <Pressable
                      className={`rounded-pill px-4 py-2 ${sentTo.has(a.userId) ? "bg-boli-green/15" : "bg-boli-orange"}`}
                      onPress={() => connect(a.userId)}
                      disabled={sentTo.has(a.userId)}
                    >
                      <Text className={sentTo.has(a.userId) ? "text-boli-green" : "text-white"}>
                        {sentTo.has(a.userId) ? "Request sent" : "Connect"}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <Pressable className="mt-2 self-start" onPress={() => router.push("/connect")}>
          <Text className="font-bold text-boli-green">Go to my Connect inbox →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
