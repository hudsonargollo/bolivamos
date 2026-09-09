import { View, Text, Linking, Pressable } from "react-native";
import Constants from "expo-constants";
import { useT } from "@/lib/i18n";

const WEB_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "http://localhost:8787";

/**
 * Venue/event-producer management (event creation, voucher builder, QR
 * generator, analytics) lives in the Host Portal on the web app, not in this
 * mobile app (PRD 4.4, see plan doc's architecture decision). This screen
 * just hands hosts off to it.
 */
export default function HostRedirectScreen() {
  const { t } = useT();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg-off-white p-8 dark:bg-dark-bg">
      <Text className="font-display text-2xl text-charcoal-dark dark:text-dark-ink">{t("hostPortalTitle")}</Text>
      <Text className="text-center text-muted-clay-gray dark:text-dark-sub">{t("hostPortalBody")}</Text>
      <Pressable
        className="rounded-pill bg-clay-terracotta px-6 py-3 shadow-clay active:translate-y-[2px]"
        onPress={() => Linking.openURL(`${WEB_BASE_URL}/host`)}
      >
        <Text className="font-bold text-white">{t("openHostPortal")}</Text>
      </Pressable>
    </View>
  );
}
