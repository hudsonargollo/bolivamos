import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { hasLikelyValidSession } from "@/lib/auth";

/** Boot screen — decides where to land based on whether a session is already stored. */
export default function Index() {
  const [status, setStatus] = useState<"checking" | "authed" | "unauthed">("checking");

  useEffect(() => {
    hasLikelyValidSession().then((ok) => setStatus(ok ? "authed" : "unauthed"));
  }, []);

  if (status === "checking") {
    return (
      <View className="flex-1 items-center justify-center bg-bg-off-white">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={status === "authed" ? "/(tabs)" : "/(onboarding)/role-select"} />;
}
