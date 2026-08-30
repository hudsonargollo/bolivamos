import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { decodeSessionUnsafe } from "@bolivamos/api-schema";
import { getStoredToken, hasLikelyValidSession } from "@/lib/auth";

type Destination = "/(tabs)/feed" | "/host-redirect" | "/(onboarding)/preferences";

/** Boot screen — decides where to land based on whether a session is already stored, and the account's actual role. */
export default function Index() {
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    hasLikelyValidSession().then(async (ok) => {
      if (!ok) {
        setDestination("/(onboarding)/preferences");
        return;
      }
      const token = await getStoredToken();
      const role = token ? decodeSessionUnsafe(token)?.role : undefined;
      setDestination(role === "host" ? "/host-redirect" : "/(tabs)/feed");
    });
  }, []);

  if (!destination) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-off-white">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={destination} />;
}
