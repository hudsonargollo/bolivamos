import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useFocusEffect, router } from "expo-router";
import type { AuthUser, VoucherDto, LockedVoucherTeaser } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";

function isLocked(item: VoucherDto | LockedVoucherTeaser): item is LockedVoucherTeaser {
  return "locked" in item;
}

export default function BoliPassScreen() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [items, setItems] = useState<(VoucherDto | LockedVoucherTeaser)[]>([]);
  const [totalSavedBob, setTotalSavedBob] = useState(0);

  const load = useCallback(() => {
    apiClient.getMe().then(setMe).catch(() => setMe(null));
    apiClient.listVouchers().then(setItems).catch(() => setItems([]));
    apiClient
      .getTotalSaved()
      .then((r) => setTotalSavedBob(r.totalSavedBob))
      .catch(() => setTotalSavedBob(0));
  }, []);

  useEffect(load, [load]);
  useFocusEffect(load); // refresh "Total Saved" after a redemption

  return (
    <View className="flex-1 bg-bg-off-white">
      <View className="bg-boli-orange px-4 pb-6 pt-16">
        <Text className="font-display text-2xl uppercase text-white">BoliPass</Text>
        {me?.isBoliPassActive ? (
          <Text className="mt-2 text-white">Total saved so far: {totalSavedBob} BOB</Text>
        ) : null}
        {me?.isBoliPassActive ? null : (
          <Pressable
            className="mt-4 rounded-pill bg-white px-5 py-3"
            onPress={() => router.push("/(tabs)/bolipass/subscribe")}
          >
            <Text className="text-center text-boli-orange">Unlock 2-for-1 deals</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        className="flex-1 px-4 pt-4"
        data={items}
        keyExtractor={(item) => (isLocked(item) ? item.voucher.id : item.id)}
        renderItem={({ item }) => {
          const voucher = isLocked(item) ? item.voucher : item;
          return (
            <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
              <Text className="text-lg text-charcoal-dark">{voucher.title}</Text>
              {voucher.termsConditions ? (
                <Text className="text-muted-clay-gray">{voucher.termsConditions}</Text>
              ) : null}
              {isLocked(item) ? (
                <Text className="mt-1 text-boli-red">
                  🔒 Unlock BoliPass to save an est. {item.estimatedSavingsBob} BOB
                </Text>
              ) : (
                <Pressable
                  className="mt-2 self-start rounded-pill bg-boli-green px-4 py-2"
                  onPress={() =>
                    router.push({ pathname: "/(tabs)/bolipass/scan", params: { voucherId: voucher.id } })
                  }
                >
                  <Text className="text-white">Redeem now</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
