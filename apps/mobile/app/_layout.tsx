import "./globals.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="host-redirect" options={{ headerShown: true, title: "Host Portal" }} />
      </Stack>
    </>
  );
}
