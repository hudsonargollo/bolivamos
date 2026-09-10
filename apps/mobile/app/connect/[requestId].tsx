import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import type { ConnectMessageDto } from "@bolivibes/api-schema";
import { apiClient } from "@/lib/api";
import { useT } from "@/lib/i18n";

export default function ConnectThreadScreen() {
  const { t } = useT();
  const { requestId, otherName, otherUserId } = useLocalSearchParams<{
    requestId: string;
    otherName?: string;
    otherUserId?: string;
  }>();
  const navigation = useNavigation();
  const [meId, setMeId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConnectMessageDto[]>([]);
  const [input, setInput] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reported, setReported] = useState(false);
  const listRef = useRef<FlatList>(null);

  const loadMessages = useCallback(() => {
    apiClient
      .getConnectMessages(requestId)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [requestId]);

  useEffect(() => {
    apiClient.getMe().then((me) => setMeId(me.id)).catch(() => setMeId(null));
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    navigation.setOptions({ title: otherName ?? t("connect") });
  }, [navigation, otherName, t]);

  async function send() {
    const content = input.trim();
    if (!content) return;
    setInput("");
    await apiClient.sendConnectMessage(requestId, { content }).catch(() => undefined);
    loadMessages();
  }

  async function block() {
    if (!otherUserId) return;
    await apiClient.blockUser(otherUserId).catch(() => undefined);
    setBlocked(true);
  }

  async function submitReport() {
    if (!otherUserId || !reportReason.trim()) return;
    await apiClient.reportUser({ reportedId: otherUserId, reason: reportReason.trim() }).catch(() => undefined);
    setReported(true);
    setReporting(false);
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg-off-white dark:bg-dark-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="flex-row justify-end gap-2 p-3">
        <Pressable className="rounded-pill bg-clay-danger/10 px-3 py-1.5" onPress={() => setReporting((v) => !v)}>
          <Text className="text-xs font-bold text-clay-danger">{t("report")}</Text>
        </Pressable>
        <Pressable className="rounded-pill bg-clay-danger/10 px-3 py-1.5" onPress={block} disabled={blocked}>
          <Text className="text-xs font-bold text-clay-danger">{blocked ? t("blocked") : t("block")}</Text>
        </Pressable>
      </View>

      {reporting && (
        <View className="mx-4 mb-3 gap-2 rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1">
          <TextInput
            className="rounded-xl border border-muted-clay-gray p-3 dark:border-dark-muted dark:text-dark-ink"
            placeholder={t("whatHappened")}
            value={reportReason}
            onChangeText={setReportReason}
            multiline
          />
          <Pressable className="self-start rounded-pill bg-clay-terracotta px-4 py-2 shadow-clay" onPress={submitReport}>
            <Text className="font-bold text-white">{t("submitReport")}</Text>
          </Pressable>
        </View>
      )}
      {reported && <Text className="px-4 pb-2 text-muted-clay-gray dark:text-dark-sub">{t("reportFiled")}</Text>}

      {blocked ? (
        <Text className="p-5 text-muted-clay-gray dark:text-dark-sub">{t("youBlockedThisPerson")}</Text>
      ) : (
        <>
          <FlatList
            ref={listRef}
            className="flex-1 px-4"
            data={messages}
            keyExtractor={(item) => item.id}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => (
              <View
                className={`mb-2 max-w-[80%] rounded-xl p-3 ${item.senderId === meId ? "self-end bg-clay-terracotta shadow-clay" : "self-start bg-white shadow-clay dark:bg-dark-card1"}`}
              >
                <Text className={item.senderId === meId ? "text-white" : "text-charcoal-dark dark:text-dark-ink"}>{item.content}</Text>
              </View>
            )}
          />
          <View className="flex-row gap-2 p-4">
            <TextInput
              className="flex-1 rounded-pill border border-muted-clay-gray px-4 py-3 dark:border-dark-muted dark:text-dark-ink"
              placeholder={t("messagePlaceholder")}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={send}
            />
            <Pressable className="justify-center rounded-pill bg-clay-terracotta px-5 shadow-clay" onPress={send}>
              <Text className="font-bold text-white">{t("send")}</Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
