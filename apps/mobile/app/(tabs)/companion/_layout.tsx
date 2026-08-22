import { Stack } from "expo-router";

export default function CompanionLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Companion" }} />
      <Stack.Screen name="itinerary" options={{ title: "Plan my trip" }} />
    </Stack>
  );
}
