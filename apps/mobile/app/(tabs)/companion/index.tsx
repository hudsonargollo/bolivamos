import { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { apiClient } from "@/lib/api";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export default function CompanionScreen() {
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!message.trim()) return;
    const userTurn: ChatTurn = { role: "user", content: message };
    const nextHistory = [...history, userTurn];
    setHistory(nextHistory);
    setMessage("");
    setSending(true);

    try {
      const { reply } = await apiClient.chat({ message: userTurn.content, history });
      setHistory([...nextHistory, { role: "assistant", content: reply }]);
    } catch {
      setHistory([
        ...nextHistory,
        { role: "assistant", content: "Sorry, I couldn't reach the concierge right now." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg-off-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="bg-boli-green px-4 pb-4 pt-16">
        <Text className="font-display text-2xl uppercase text-white">Concierge</Text>
        <Pressable
          className="mt-3 self-start rounded-pill bg-white px-4 py-2"
          onPress={() => router.push("/(tabs)/companion/itinerary")}
        >
          <Text className="text-boli-green">Build me an itinerary</Text>
        </Pressable>
      </View>

      <FlatList
        className="flex-1 px-4 pt-4"
        data={history}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View
            className={`mb-2 max-w-[85%] rounded-lg p-3 ${item.role === "user" ? "self-end bg-boli-orange" : "self-start bg-white"}`}
          >
            <Text className={item.role === "user" ? "text-white" : "text-charcoal-dark"}>{item.content}</Text>
          </View>
        )}
      />

      <View className="flex-row gap-2 p-4">
        <TextInput
          className="flex-1 rounded-pill border border-muted-clay-gray px-4 py-3"
          placeholder="Ask about nightlife, food, transport..."
          value={message}
          onChangeText={setMessage}
          editable={!sending}
        />
        <Pressable className="justify-center rounded-pill bg-boli-green px-5" onPress={send} disabled={sending}>
          <Text className="text-white">Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
