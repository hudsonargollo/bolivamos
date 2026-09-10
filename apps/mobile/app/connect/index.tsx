import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect, router } from "expo-router";
import type { ConnectRequestDto, EventDto } from "@bolivibes/api-schema";
import { apiClient } from "@/lib/api";
import { useT, type StringKey } from "@/lib/i18n";
import { ComingSoon } from "@/components/ComingSoon";

interface Enriched {
  request: ConnectRequestDto;
  otherName: string;
  eventTitle: string;
}

type Tab = "boards" | "people" | "crews" | "match";
const TABS: { key: Tab; labelKey: StringKey }[] = [
  { key: "boards", labelKey: "boards" },
  { key: "people", labelKey: "people" },
  { key: "crews", labelKey: "crews" },
  { key: "match", labelKey: "match" },
];

function PeopleTab() {
  const { t } = useT();
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
      className="flex-1"
      contentContainerClassName="gap-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      {incoming.length > 0 && (
        <View className="gap-2">
          <Text className="font-display text-muted-clay-gray dark:text-dark-sub">{t("requestsForYou")}</Text>
          {incoming.map(({ request, otherName, eventTitle }) => (
            <View key={request.id} className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1">
              <View className="flex-1 pr-2">
                <Text className="font-bold text-charcoal-dark dark:text-dark-ink">{otherName}</Text>
                <Text className="text-muted-clay-gray dark:text-dark-sub">{eventTitle}</Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable className="rounded-pill bg-clay-sage px-3 py-2 shadow-clay-sage" onPress={() => respond(request.id, true)}>
                  <Text className="font-bold text-white">{t("accept")}</Text>
                </Pressable>
                <Pressable className="rounded-pill bg-clay-sage/10 px-3 py-2" onPress={() => respond(request.id, false)}>
                  <Text className="font-bold text-clay-sage-dk">{t("decline")}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {accepted.length > 0 && (
        <View className="gap-2">
          <Text className="font-display text-muted-clay-gray dark:text-dark-sub">{t("conversations")}</Text>
          {accepted.map(({ request, otherName, eventTitle }) => (
            <Pressable
              key={request.id}
              className="rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1"
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
              <Text className="font-bold text-charcoal-dark dark:text-dark-ink">{otherName}</Text>
              <Text className="text-muted-clay-gray dark:text-dark-sub">{eventTitle}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {sent.length > 0 && (
        <View className="gap-2">
          <Text className="font-display text-muted-clay-gray dark:text-dark-sub">{t("sentAwaitingReply")}</Text>
          {sent.map(({ request, otherName, eventTitle }) => (
            <View key={request.id} className="rounded-xl bg-white p-4 shadow-clay opacity-70 dark:bg-dark-card1">
              <Text className="text-charcoal-dark dark:text-dark-ink">{otherName}</Text>
              <Text className="text-muted-clay-gray dark:text-dark-sub">{eventTitle}</Text>
            </View>
          ))}
        </View>
      )}

      {incoming.length === 0 && accepted.length === 0 && sent.length === 0 && (
        <Text className="text-muted-clay-gray dark:text-dark-sub">{t("noConnectionsYet")}</Text>
      )}
      {meId === null && !refreshing && (
        <Text className="text-muted-clay-gray dark:text-dark-sub">{t("loginToSeeConnections")}</Text>
      )}
    </ScrollView>
  );
}

export default function ConnectScreen() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("people");

  return (
    <View className="flex-1 bg-bg-off-white p-5 pt-16 dark:bg-dark-bg">
      <Text className="mb-4 font-display text-3xl text-charcoal-dark dark:text-dark-ink">{t("connect")}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 grow-0" contentContainerClassName="gap-2">
        {TABS.map((x) => (
          <Pressable
            key={x.key}
            onPress={() => setTab(x.key)}
            className={`rounded-pill px-4 py-2 ${tab === x.key ? "bg-clay-terracotta shadow-clay" : "bg-white dark:bg-dark-card1"}`}
          >
            <Text className={`font-bold ${tab === x.key ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}`}>{t(x.labelKey)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === "people" && <PeopleTab />}
      {tab === "boards" && <ComingSoon icon="chatbubbles-outline" title={t("boards")} body={t("boardsComingSoon")} />}
      {tab === "crews" && <ComingSoon icon="people-circle-outline" title={t("crews")} body={t("crewsComingSoon")} />}
      {tab === "match" && <ComingSoon icon="heart-outline" title={t("match")} body={t("matchComingSoon")} />}
    </View>
  );
}
