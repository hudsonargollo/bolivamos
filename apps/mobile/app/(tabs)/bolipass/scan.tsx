import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import type { QrPayload } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";
import { useT } from "@/lib/i18n";

type RedeemState = "scanning" | "redeeming" | "success" | "error";

export default function ScanScreen() {
  const { t } = useT();
  const { voucherId } = useLocalSearchParams<{ voucherId: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<RedeemState>("scanning");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scanned = useRef(false);
  const badgeScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    if (state === "success") {
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [state, badgeScale]);

  async function handleScan(rawData: string) {
    if (scanned.current || !voucherId) return;
    scanned.current = true;
    setState("redeeming");

    try {
      const qrPayload = JSON.parse(rawData) as QrPayload;
      await apiClient.redeemVoucher({ voucherId, qrPayload });
      setState("success");
    } catch {
      setErrorMessage(t("redeemError"));
      setState("error");
    }
  }

  if (!permission?.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-charcoal-dark p-8">
        <Text className="text-center text-white">{t("cameraNeeded")}</Text>
      </View>
    );
  }

  if (state === "success") {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-clay-sage p-8">
        <Animated.View style={{ transform: [{ scale: badgeScale }] }}>
          <Text className="text-6xl">✅</Text>
        </Animated.View>
        <Text className="text-center text-2xl text-white">{t("redeemed")}</Text>
        <Pressable className="rounded-pill bg-white px-6 py-3 shadow-clay-sage active:translate-y-[2px]" onPress={() => router.back()}>
          <Text className="font-bold text-clay-sage-dk">{t("done")}</Text>
        </Pressable>
      </View>
    );
  }

  if (state === "error") {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-clay-danger p-8">
        <Text className="text-center text-white">{errorMessage}</Text>
        <Pressable
          className="rounded-pill bg-white px-6 py-3 shadow-clay-danger active:translate-y-[2px]"
          onPress={() => {
            scanned.current = false;
            setState("scanning");
          }}
        >
          <Text className="font-bold text-clay-danger">{t("tryAgain")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={(result) => handleScan(result.data)}
      />
      {state === "redeeming" && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <Text className="text-white">{t("redeeming")}</Text>
        </View>
      )}
    </View>
  );
}
