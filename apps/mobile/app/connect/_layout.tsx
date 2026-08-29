import { Stack } from "expo-router";

export default function ConnectLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Connect" }} />
      <Stack.Screen name="[requestId]" options={{ title: "Connect" }} />
    </Stack>
  );
}
