import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect, router } from "expo-router";
import type { ConnectRequestDto, EventDto } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";

interface Enriched {
  request: ConnectRequestDto;
  otherName: string;
  eventTitle: string;
}

export default function ConnectInboxScreen() {
  const [meId, setMeId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<Enriched[]>([]);
  const [accepted, setAccepted] = useState<Enriched[]>([]);
  const [sent, setSent] = useState<Enriched[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [me, requests] = await Promise.all([apiClient.getMe(), apiClient.listConnectRequests()]);
      setMeId(me.id);

      // Names for the other party in each request come from that event's
      // visible-attendee list — there's no general "look up any user" endpoint,
      // by design, so this falls back to a generic label when it can't resolve.
      const eventCache = new Map<string, EventDto>();
      const attendeeCache = new Map<string, Map<string, string | null>>();
      async function nameFor(eventId: string, userId: string): Promise<string> {
        if (!attendeeCache.has(eventId)) {
          const attendees = await apiClient.getEventAttendees(eventId).catch(() => []);
          attendeeCache.set(eventId, new Map(attendees.map((a) => [a.userId, a.fullName])));
        }
        return attendeeCache.get(eventId)?.get(userId) ?? "A fellow VIP member";
      }
      async function titleFor(eventId: string): Promise<string> {
        if (!eventCache.has(eventId)) {
          const event = await apiClient.getEvent(eventId).catch(() => null);
          if (event) eventCache.set(eventId, event);
        }
        return eventCache.get(eventId)?.title ?? "an event";
      }

      const enrich = async (r: ConnectRequestDto, otherId: string): Promise<Enriched> => ({
        request: r,
        otherName: await nameFor(r.eventId, otherId),
        eventTitle: await titleFor(r.eventId),
      });

      const incomingReq = requests.filter((r) => r.toUserId === me.id && r.status === "pending");
      const acceptedReq = requests.filter((r) => r.status === "accepted");
      const sentReq = requests.filter((r) => r.fromUserId === me.id && r.status === "pending");

      setIncoming(await Promise.all(incomingReq.map((r) => enrich(r, r.fromUserId))));
      setAccepted(
        await Promise.all(acceptedReq.map((r) => enrich(r, r.fromUserId === me.id ? r.toUserId : r.fromUserId))),
      );
      setSent(await Promise.all(sentReq.map((r) => enrich(r, r.toUserId))));
    } catch {
      setIncoming([]);
      setAccepted([]);
      setSent([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function respond(id: string, accept: boolean) {
    await apiClient.respondConnectRequest(id, { accept }).catch(() => undefined);
    load();
  }

  return (
    <ScrollView
      className="flex-1 bg-bg-off-white"
      contentContainerClassName="gap-6 p-5"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      {incoming.length > 0 && (
        <View className="gap-2">
          <Text className="font-display uppercase text-muted-clay-gray">Requests for you</Text>
          {incoming.map(({ request, otherName, eventTitle }) => (
            <View key={request.id} className="flex-row items-center justify-between rounded-lg bg-white p-4 shadow-sm">
              <View className="flex-1 pr-2">
                <Text className="font-bold text-charcoal-dark">{otherName}</Text>
                <Text className="text-muted-clay-gray">{eventTitle}</Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable className="rounded-pill bg-boli-green px-3 py-2" onPress={() => respond(request.id, true)}>
                  <Text className="text-white">Accept</Text>
                </Pressable>
                <Pressable className="rounded-pill bg-boli-green/10 px-3 py-2" onPress={() => respond(request.id, false)}>
                  <Text className="text-boli-green">Decline</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {accepted.length > 0 && (
        <View className="gap-2">
          <Text className="font-display uppercase text-muted-clay-gray">Conversations</Text>
          {accepted.map(({ request, otherName, eventTitle }) => (
            <Pressable
              key={request.id}
              className="rounded-lg bg-white p-4 shadow-sm"
              onPress={() =>
                router.push({
                  pathname: "/connect/[requestId]",
                  params: {
                    requestId: request.id,
                    otherName,
                    otherUserId: request.fromUserId === meId ? request.toUserId : request.fromUserId,
                  },
                })
              }
            >
              <Text className="font-bold text-charcoal-dark">{otherName}</Text>
              <Text className="text-muted-clay-gray">{eventTitle}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {sent.length > 0 && (
        <View className="gap-2">
          <Text className="font-display uppercase text-muted-clay-gray">Sent, awaiting reply</Text>
          {sent.map(({ request, otherName, eventTitle }) => (
            <View key={request.id} className="rounded-lg bg-white p-4 shadow-sm opacity-70">
              <Text className="text-charcoal-dark">{otherName}</Text>
              <Text className="text-muted-clay-gray">{eventTitle}</Text>
            </View>
          ))}
        </View>
      )}

      {incoming.length === 0 && accepted.length === 0 && sent.length === 0 && (
        <Text className="text-muted-clay-gray">
          No connections yet — opt in to be visible on an event page and connect with other VIP
          members going.
        </Text>
      )}
      {meId === null && !refreshing && (
        <Text className="text-muted-clay-gray">Log in to see your connections.</Text>
      )}
    </ScrollView>
  );
}
