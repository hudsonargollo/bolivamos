import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import type { ConnectMessageDto } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";

export default function ConnectThreadScreen() {
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
    navigation.setOptions({ title: otherName ?? "Connect" });
  }, [navigation, otherName]);

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
    <KeyboardAvoidingView className="flex-1 bg-bg-off-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="flex-row justify-end gap-2 p-3">
        <Pressable className="rounded-pill bg-boli-orange/10 px-3 py-1.5" onPress={() => setReporting((v) => !v)}>
          <Text className="text-xs font-bold text-boli-red">Report</Text>
        </Pressable>
        <Pressable className="rounded-pill bg-boli-orange/10 px-3 py-1.5" onPress={block} disabled={blocked}>
          <Text className="text-xs font-bold text-boli-red">{blocked ? "Blocked" : "Block"}</Text>
        </Pressable>
      </View>

      {reporting && (
        <View className="mx-4 mb-3 gap-2 rounded-lg bg-white p-4 shadow-sm">
          <TextInput
            className="rounded-lg border border-muted-clay-gray p-3"
            placeholder="What happened?"
            value={reportReason}
            onChangeText={setReportReason}
            multiline
          />
          <Pressable className="self-start rounded-pill bg-boli-orange px-4 py-2" onPress={submitReport}>
            <Text className="text-white">Submit report</Text>
          </Pressable>
        </View>
      )}
      {reported && <Text className="px-4 pb-2 text-muted-clay-gray">Report filed — an admin will review it.</Text>}

      {blocked ? (
        <Text className="p-5 text-muted-clay-gray">You&rsquo;ve blocked this person. This conversation is now closed.</Text>
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
                className={`mb-2 max-w-[80%] rounded-lg p-3 ${item.senderId === meId ? "self-end bg-boli-orange" : "self-start bg-white"}`}
              >
                <Text className={item.senderId === meId ? "text-white" : "text-charcoal-dark"}>{item.content}</Text>
              </View>
            )}
          />
          <View className="flex-row gap-2 p-4">
            <TextInput
              className="flex-1 rounded-pill border border-muted-clay-gray px-4 py-3"
              placeholder="Message…"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={send}
            />
            <Pressable className="justify-center rounded-pill bg-boli-green px-5" onPress={send}>
              <Text className="text-white">Send</Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
