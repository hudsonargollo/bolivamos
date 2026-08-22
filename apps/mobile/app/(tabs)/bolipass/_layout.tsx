import { Stack } from "expo-router";

export default function BoliPassLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "BoliPass" }} />
      <Stack.Screen name="subscribe" options={{ title: "Get BoliPass" }} />
      <Stack.Screen name="scan" options={{ title: "Redeem", presentation: "fullScreenModal" }} />
    </Stack>
  );
}
