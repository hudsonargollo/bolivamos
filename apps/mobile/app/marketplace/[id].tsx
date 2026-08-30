import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import type { ProductDto, OrderPaymentMethod, CreateOrderResponse } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";

const METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  stripe: "Credit / debit card",
  qr_bolivia: "QR Bolivia",
  qr_pix: "QR PIX (Brazil)",
  crypto: "Crypto",
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [method, setMethod] = useState<OrderPaymentMethod>("qr_bolivia");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateOrderResponse | null>(null);

  useEffect(() => {
    apiClient.getProduct(id).then((p) => {
      setProduct(p);
      if (p.priceUsd != null) setMethod("stripe");
    }).catch(() => setProduct(null));
  }, [id]);

  async function buy() {
    setSubmitting(true);
    try {
      const order = await apiClient.createOrder({ productId: id, quantity: 1, paymentMethod: method });
      if (order.stripeCheckoutUrl) {
        await WebBrowser.openBrowserAsync(order.stripeCheckoutUrl);
        return;
      }
      setResult(order);
    } catch {
      // no-op — button re-enables so the buyer can retry
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-off-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg-off-white p-5">
      <Text className="font-display text-2xl uppercase text-charcoal-dark">{product.title}</Text>
      {product.description ? <Text className="mt-2 text-muted-clay-gray">{product.description}</Text> : null}
      <Text className="mt-3 text-lg font-bold text-charcoal-dark">
        {product.priceBob.toFixed(2)} BOB{product.priceUsd != null ? ` · $${product.priceUsd.toFixed(2)}` : ""}
      </Text>

      {result?.paymentInstructions ? (
        <View className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <Text className="font-bold text-charcoal-dark">Pay via {result.paymentInstructions.label}</Text>
          {result.paymentInstructions.qrImageUrl ? (
            <Image
              source={{ uri: result.paymentInstructions.qrImageUrl }}
              className="mt-2 h-48 w-48 rounded-lg"
              resizeMode="contain"
            />
          ) : null}
          {result.paymentInstructions.addressOrKey ? (
            <Text className="mt-2 font-mono text-xs">{result.paymentInstructions.addressOrKey}</Text>
          ) : null}
          {result.paymentInstructions.instructions ? (
            <Text className="mt-2 text-muted-clay-gray">{result.paymentInstructions.instructions}</Text>
          ) : null}
          <Text className="mt-3 text-xs text-muted-clay-gray">
            Order #{result.order.id.slice(0, 8)} is pending — it&rsquo;ll be marked paid once we confirm your payment.
          </Text>
        </View>
      ) : (
        <View className="mt-4 gap-3 rounded-lg bg-white p-4 shadow-sm">
          <Text className="font-bold text-charcoal-dark">Pay with</Text>
          <View className="flex-row flex-wrap gap-2">
            {(Object.keys(METHOD_LABELS) as OrderPaymentMethod[])
              .filter((m) => m !== "stripe" || product.priceUsd != null)
              .map((m) => (
                <Pressable
                  key={m}
                  className={`rounded-pill px-4 py-2 ${method === m ? "bg-boli-orange" : "bg-boli-orange/10"}`}
                  onPress={() => setMethod(m)}
                >
                  <Text className={method === m ? "text-white" : "text-boli-orange"}>{METHOD_LABELS[m]}</Text>
                </Pressable>
              ))}
          </View>
          <Pressable className="mt-2 self-start rounded-pill bg-boli-red px-5 py-3" onPress={buy} disabled={submitting}>
            <Text className="font-bold text-white">
              {submitting ? "Starting checkout…" : `Buy — ${product.priceBob.toFixed(2)} BOB`}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
