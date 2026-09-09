import "./globals.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Caprasimo_400Regular } from "@expo-google-fonts/caprasimo";
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from "@expo-google-fonts/archivo";
import { I18nProvider } from "@/lib/i18n";
import { useTheme } from "@/lib/use-theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar style={scheme === "dark" ? "light" : "dark"} />;
}

export default function RootLayout() {
  // Caprasimo replaces Anton as the display font (mobile-v2 reskin) —
  // unifies with the admin dashboard's already-live Caprasimo headlines.
  const [fontsLoaded] = useFonts({
    Caprasimo_400Regular,
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <I18nProvider>
      <ThemedStatusBar />
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="host-redirect" options={{ headerShown: true, title: "Host Portal" }} />
      </Stack>
    </I18nProvider>
  );
}
