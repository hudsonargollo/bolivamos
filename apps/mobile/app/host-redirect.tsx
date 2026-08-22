import { View, Text, Linking, Pressable } from "react-native";
import Constants from "expo-constants";

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
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg-off-white p-8">
      <Text className="font-display text-2xl uppercase text-charcoal-dark">Host Portal</Text>
      <Text className="text-center text-muted-clay-gray">
        Managing events, BoliPass vouchers, and your venue's QR code happens on the BoliVamos web
        Host Portal.
      </Text>
      <Pressable
        className="rounded-pill bg-boli-green px-6 py-3"
        onPress={() => Linking.openURL(`${WEB_BASE_URL}/host`)}
      >
        <Text className="text-white">Open Host Portal</Text>
      </Pressable>
    </View>
  );
}
