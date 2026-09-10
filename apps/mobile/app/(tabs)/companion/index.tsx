import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { apiClient } from "@/lib/api";
import { useT, type StringKey } from "@/lib/i18n";
import { SunMark } from "@/components/SunMark";
import type { AuthUser } from "@bolivibes/api-schema";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// Real quick-reply chips — tapping one sends an actual message to the real
// Gemini-backed /api/ai/chat endpoint and shows whatever it really replies,
// not scripted/canned text like the mobile-v2 prototype's version of this.
const QUICK_REPLIES: { labelKey: StringKey; messageEn: string; messageEs: string }[] = [
  { labelKey: "planMyNight", messageEn: "Plan my night — what should I do tonight?", messageEs: "Planea mi noche — ¿qué debería hacer esta noche?" },
  { labelKey: "localTips", messageEn: "Where do locals actually go?", messageEs: "¿A dónde va la gente local realmente?" },
  { labelKey: "bookATable", messageEn: "Can you help me book a table somewhere?", messageEs: "¿Me ayudas a reservar una mesa?" },
  { labelKey: "translate", messageEn: "How do I say \"two tickets please\" in Spanish?", messageEs: "¿Cómo digo \"two tickets please\" en inglés?" },
];

export default function CompanionScreen() {
  const { t, locale } = useT();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  // Set once the first reply comes back; passing it on every later call keeps
  // the whole conversation server-persisted instead of resending history each time.
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  useEffect(() => {
    apiClient.getMe().then(setMe).catch(() => setMe(null));
  }, []);

  async function sendText(text: string) {
    if (!text.trim()) return;
    const userTurn: ChatTurn = { role: "user", content: text };
    const nextHistory = [...history, userTurn];
    setHistory(nextHistory);
    setMessage("");
    setSending(true);

    try {
      const { reply, conversationId: id } = await apiClient.chat({
        message: userTurn.content,
        history,
        conversationId,
      });
      setConversationId(id);
      setHistory([...nextHistory, { role: "assistant", content: reply }]);
    } catch {
      setHistory([
        ...nextHistory,
        { role: "assistant", content: t("concierdeUnreachable") },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg-off-white dark:bg-dark-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-row items-center gap-3 bg-charcoal-dark px-4 pb-4 pt-16 dark:bg-dark-bg2">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-clay-terracotta shadow-clay">
          <SunMark size={26} ring="#f5ead8" spin />
        </View>
        <View className="flex-1">
          <Text className="font-display text-lg text-white">{t("tabCompanion")}</Text>
        </View>
        <Pressable
          className={`rounded-pill px-3 py-1.5 ${me?.isBoliPassActive ? "bg-clay-sage" : "bg-white/15"}`}
          onPress={() => router.push("/(tabs)/bolipass")}
        >
          <Text className="text-xs font-bold text-white">{me?.isBoliPassActive ? `${t("tabBolipass")} ✓` : t("tabBolipass")}</Text>
        </Pressable>
      </View>

      {me && !me.isBoliPassActive && (
        <Pressable
          className="mx-4 mt-3 flex-row items-center gap-2 rounded-xl bg-clay-terracotta/14 px-4 py-3"
          onPress={() => router.push("/(tabs)/bolipass")}
        >
          <Text className="flex-1 text-xs font-bold text-clay-terracotta-dk">{t("bolipassMembersCanSee")}</Text>
        </Pressable>
      )}

      <FlatList
        className="flex-1 px-4 pt-4"
        data={history}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View
            className={`mb-2 max-w-[85%] rounded-xl p-3 ${item.role === "user" ? "self-end bg-clay-terracotta shadow-clay" : "self-start bg-white shadow-clay dark:bg-dark-card1"}`}
          >
            <Text className={item.role === "user" ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}>{item.content}</Text>
          </View>
        )}
      />

      <View className="px-4 pt-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-2">
          {QUICK_REPLIES.map((q) => (
            <Pressable
              key={q.labelKey}
              className="rounded-pill border border-muted-clay-gray px-4 py-2 dark:border-dark-muted"
              onPress={() => sendText(locale === "es" ? q.messageEs : q.messageEn)}
              disabled={sending}
            >
              <Text className="font-bold text-xs text-charcoal-dark dark:text-dark-ink">{t(q.labelKey)}</Text>
            </Pressable>
          ))}
          <Pressable
            className="rounded-pill border border-muted-clay-gray px-4 py-2 dark:border-dark-muted"
            onPress={() => router.push("/(tabs)/companion/itinerary")}
          >
            <Text className="font-bold text-xs text-charcoal-dark dark:text-dark-ink">{t("planMyTrip")}</Text>
          </Pressable>
        </ScrollView>
      </View>

      <View className="flex-row gap-2 p-4 pt-0">
        <TextInput
          className="flex-1 rounded-pill border border-muted-clay-gray px-4 py-3 dark:border-dark-muted dark:text-dark-ink"
          placeholder={t("askAnything")}
          value={message}
          onChangeText={setMessage}
          editable={!sending}
        />
        <Pressable className="justify-center rounded-pill bg-clay-terracotta px-5 shadow-clay active:translate-y-[2px]" onPress={() => sendText(message)} disabled={sending}>
          <Text className="font-bold text-white">{t("send")}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
