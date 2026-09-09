import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { AuthUser, VoucherDto, LockedVoucherTeaser } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";
import { useT, type StringKey } from "@/lib/i18n";
import { SunMark } from "@/components/SunMark";

function isLocked(item: VoucherDto | LockedVoucherTeaser): item is LockedVoucherTeaser {
  return "locked" in item;
}

// What's actually real today — not the prototype's fabricated 10-20%/skip-
// the-line/free-drink numbers, which don't match the live product.
const PERKS: { icon: keyof typeof Ionicons.glyphMap; titleKey: StringKey; bodyKey: StringKey }[] = [
  { icon: "pricetag-outline", titleKey: "perkVoucher", bodyKey: "perkVoucherBody" },
  { icon: "people-outline", titleKey: "perkConnect", bodyKey: "perkConnectBody" },
  { icon: "sparkles-outline", titleKey: "perkConcierge", bodyKey: "perkConciergeBody" },
];

export default function BoliPassScreen() {
  const { t } = useT();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [items, setItems] = useState<(VoucherDto | LockedVoucherTeaser)[]>([]);
  const [totalSavedBob, setTotalSavedBob] = useState(0);

  const load = useCallback(() => {
    // Returning here from the subscribe screen's in-app browser can race the
    // Stripe webhook that actually flips isBolipassActive in D1 — the
    // browser resolves as soon as the user closes it, which may be before
    // the webhook has round-tripped. Retry a few times with backoff rather
    // than assuming instant consistency.
    const RETRY_DELAYS_MS = [0, 2000, 5000];
    let cancelled = false;
    const attempt = (i: number) => {
      apiClient
        .getMe()
        .then((user) => {
          if (cancelled) return;
          setMe(user);
          if (!user.isBoliPassActive && i + 1 < RETRY_DELAYS_MS.length) {
            setTimeout(() => attempt(i + 1), RETRY_DELAYS_MS[i + 1]);
          }
        })
        .catch(() => !cancelled && setMe(null));
    };
    attempt(0);
    apiClient.listVouchers().then(setItems).catch(() => setItems([]));
    apiClient
      .getTotalSaved()
      .then((r) => setTotalSavedBob(r.totalSavedBob))
      .catch(() => setTotalSavedBob(0));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(load, [load]);
  useFocusEffect(load); // refresh "Total Saved" after a redemption

  const vip = Boolean(me?.isBoliPassActive);
  const name = me?.fullName ?? me?.email ?? "";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <FlatList
      className="flex-1 bg-bg-off-white dark:bg-dark-bg"
      contentContainerClassName="px-4 pb-8"
      data={items}
      keyExtractor={(item) => (isLocked(item) ? item.voucher.id : item.id)}
      ListHeaderComponent={
        <View className="pb-2 pt-16">
          {/* Membership card */}
          <View
            className="mb-4 overflow-hidden rounded-2xl p-5"
            style={{ backgroundColor: "#232840", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 }}
          >
            <View className="absolute -right-8 -top-8 opacity-25">
              <SunMark size={150} ring="#f5ead8" />
            </View>
            <Text className="font-display text-base text-[#f5ead8]">
              BOLI<Text className="text-boli-orange">PASS</Text>
            </Text>
            <Text className="mb-6 mt-1 text-xs font-bold tracking-widest" style={{ color: vip ? "#a3b58c" : "#8a7c63" }}>
              {vip ? t("vipMember") : t("freePlan")}
            </Text>
            <View className="flex-row items-end justify-between">
              <View>
                <Text className="font-bold text-[#f5ead8]">{name || "—"}</Text>
                <Text className="mt-0.5 text-xs font-semibold text-[#a99f8d]">
                  {vip ? t("bolipassActive") : t("upgradeToActivate")}
                </Text>
              </View>
              <View
                className="h-16 w-16 items-center justify-center rounded-xl"
                style={{ backgroundColor: vip ? "#f5ead8" : "rgba(245,234,216,.14)" }}
              >
                <Text className="font-display text-lg" style={{ color: vip ? "#232840" : "#8a7c63" }}>
                  {initials || "—"}
                </Text>
              </View>
            </View>
          </View>

          {vip && (
            <Text className="mb-4 font-bold text-charcoal-dark dark:text-dark-ink">
              {t("totalSavedSoFar")} {totalSavedBob} BOB
            </Text>
          )}

          {!vip && (
            <>
              <Text className="mb-2 font-bold text-xs uppercase tracking-wide text-muted-clay-gray dark:text-dark-sub">
                {t("whatVipUnlocks")}
              </Text>
              <View className="mb-4 gap-2">
                {PERKS.map((p) => (
                  <View key={p.titleKey} className="flex-row items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-dark-card1">
                    <View className="h-9 w-9 items-center justify-center rounded-lg bg-clay-terracotta/14">
                      <Ionicons name={p.icon} size={17} color="#8f4225" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-sm text-charcoal-dark dark:text-dark-ink">{t(p.titleKey)}</Text>
                      <Text className="mt-0.5 text-xs font-semibold text-muted-clay-gray dark:text-dark-sub">{t(p.bodyKey)}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Pressable
                className="mb-5 items-center rounded-pill bg-clay-terracotta py-4 shadow-clay active:translate-y-[3px]"
                onPress={() => router.push("/(tabs)/bolipass/subscribe")}
              >
                <Text className="font-bold text-white">{t("unlock2for1")}</Text>
              </Pressable>
            </>
          )}
        </View>
      }
      renderItem={({ item }) => {
        const voucher = isLocked(item) ? item.voucher : item;
        return (
          <View className="mb-3 rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1">
            <Text className="text-lg text-charcoal-dark dark:text-dark-ink">{voucher.title}</Text>
            {voucher.termsConditions ? (
              <Text className="text-muted-clay-gray dark:text-dark-sub">{voucher.termsConditions}</Text>
            ) : null}
            {isLocked(item) ? (
              <Text className="mt-1 text-clay-danger">
                {t("unlockBolipassToSave")} {item.estimatedSavingsBob} BOB
              </Text>
            ) : (
              <Pressable
                className="mt-2 self-start rounded-pill bg-clay-sage px-4 py-2 shadow-clay-sage active:translate-y-[2px]"
                onPress={() =>
                  router.push({ pathname: "/(tabs)/bolipass/scan", params: { voucherId: voucher.id } })
                }
              >
                <Text className="font-bold text-white">{t("redeemNow")}</Text>
              </Pressable>
            )}
          </View>
        );
      }}
    />
  );
}
