import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import type { ProductDto } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";

const TYPE_LABELS: Record<ProductDto["type"], string> = {
  tour: "Tour",
  audio_tour: "Audio tour",
  ticket: "Ticket",
};

export default function MarketplaceScreen() {
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
    <View className="flex-1 bg-bg-off-white p-5">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? <Text className="text-muted-clay-gray">Nothing listed yet — check back soon.</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable className="mb-3 rounded-lg bg-white p-4 shadow-sm" onPress={() => router.push(`/marketplace/${item.id}`)}>
            <View className="self-start rounded-pill bg-boli-green/10 px-2 py-0.5">
              <Text className="text-xs font-bold text-boli-green">{TYPE_LABELS[item.type]}</Text>
            </View>
            <Text className="mt-2 text-lg font-bold text-charcoal-dark">{item.title}</Text>
            <Text className="text-muted-clay-gray">{item.priceBob.toFixed(2)} BOB</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
