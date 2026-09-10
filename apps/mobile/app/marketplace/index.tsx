import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import type { ProductDto } from "@bolivibes/api-schema";
import { apiClient } from "@/lib/api";
import { useT } from "@/lib/i18n";

const TYPE_LABELS: Record<ProductDto["type"], string> = {
  tour: "Tour",
  audio_tour: "Audio tour",
  ticket: "Ticket",
};

export default function MarketplaceScreen() {
  const { t } = useT();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .listProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View className="flex-1 bg-bg-off-white p-5 dark:bg-dark-bg">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? <Text className="text-muted-clay-gray dark:text-dark-sub">{t("nothingListedYet")}</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable className="mb-3 rounded-xl bg-white p-4 shadow-clay dark:bg-dark-card1" onPress={() => router.push(`/marketplace/${item.id}`)}>
            <View className="self-start rounded-pill bg-clay-sage/10 px-2 py-0.5">
              <Text className="text-xs font-bold text-clay-sage-dk">{TYPE_LABELS[item.type]}</Text>
            </View>
            <Text className="mt-2 text-lg font-bold text-charcoal-dark dark:text-dark-ink">{item.title}</Text>
            <Text className="text-muted-clay-gray dark:text-dark-sub">{item.priceBob.toFixed(2)} BOB</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
