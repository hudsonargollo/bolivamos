import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function RoleSelectScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-bg-off-white p-8">
      <Text className="font-display text-3xl uppercase text-charcoal-dark">BoliVamos</Text>
      <Text className="text-center text-muted-clay-gray">How do you want to use BoliVamos?</Text>

      <Pressable
        className="w-full rounded-lg bg-boli-green p-4 shadow-md"
        onPress={() => router.push("/(onboarding)/preferences")}
      >
        <Text className="text-center text-lg text-white">I am a Visitor / Explorer</Text>
      </Pressable>

      <Pressable
        className="w-full rounded-lg border border-boli-green p-4"
        onPress={() => router.push("/host-redirect")}
      >
        <Text className="text-center text-lg text-boli-green">I am a Host (Venue / Event Producer)</Text>
      </Pressable>
    </View>
  );
}
