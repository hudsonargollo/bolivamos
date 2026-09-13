import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { BrandIcon } from "@/components/BrandIcon";

const SLIDES = [
  {
    kicker: "For locals + visitors",
    title: "Find the night before it finds you.",
    body: "Events, food, culture, places, and BoliPass deals in Santa Cruz — personalized after three quick choices.",
    icon: "sparkles-outline" as const,
    accent: "#e3a52f",
  },
  {
    kicker: "For venue owners",
    title: "Turn attention into real visits.",
    body: "Business accounts can publish, promote, and manage venue visibility from the host portal.",
    icon: "storefront-outline" as const,
    accent: "#8ba672",
  },
  {
    kicker: "Freemium by design",
    title: "Start free. Upgrade when value is clear.",
    body: "Explore first, save preferences, then sign in as Personal or Business when you’re ready.",
    icon: "shield-checkmark-outline" as const,
    accent: "#c4703d",
  },
];

function ClayIllustration({ step }: { step: number }) {
  const dots = step === 1 ? ["#8ba672", "#e2792f", "#f7f1e4"] : step === 2 ? ["#c04a2f", "#e3a52f", "#8ba672"] : ["#e3a52f", "#c4703d", "#8ba672"];
  return (
    <View className="relative h-44 w-full overflow-hidden rounded-[34px] bg-[#f7f1e4] shadow-clay">
      <View className="absolute bottom-0 h-12 w-full bg-[#dccbaa]" />
      <View className="absolute bottom-12 left-6 h-20 w-12 rounded-t-xl bg-[#fdfaf3]" />
      <View className="absolute bottom-12 left-24 h-28 w-14 rounded-t-xl bg-[#8ba672]" />
      <View className="absolute bottom-12 right-20 h-24 w-12 rounded-t-xl bg-[#c4703d]" />
      <View className="absolute bottom-12 right-6 h-32 w-14 rounded-t-xl bg-[#efe4d2]" />
      <View className="absolute left-6 top-6 rounded-pill bg-[#33302c] px-4 py-2">
        <Text className="font-bold text-xs text-[#f7f1e4]">BoliVibes</Text>
      </View>
      {dots.map((color, index) => (
        <View
          key={`${color}-${index}`}
          className="absolute h-5 w-5 rounded-full"
          style={{ backgroundColor: color, top: 28 + index * 28, right: 24 + index * 26 }}
        />
      ))}
      <View className="absolute bottom-7 left-1/2 h-10 w-32 -translate-x-16 rounded-pill bg-white/70" />
    </View>
  );
}

export default function OnboardingSlides() {
  const [step, setStep] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;
  const slide = SLIDES[step];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1050, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1050, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  function next() {
    if (step < SLIDES.length - 1) setStep(step + 1);
    else router.push("/(onboarding)/preferences");
  }

  const logoScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const logoTranslate = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });

  return (
    <SafeAreaView className="flex-1 bg-[#232840]">
      <View className="flex-1 px-6 pb-7 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-xs uppercase tracking-[2px] text-[#f5ead8]/70">BoliVibes setup</Text>
          <Pressable onPress={() => router.push("/(onboarding)/preferences")} hitSlop={10}>
            <Text className="font-bold text-sm text-[#dccbaa]">Skip</Text>
          </Pressable>
        </View>

        <View className="items-center py-5">
          <Animated.View style={{ transform: [{ translateY: logoTranslate }, { scale: logoScale }] }}>
            <BrandIcon size={116} />
          </Animated.View>
        </View>

        <ClayIllustration step={step} />

        <View className="mt-7 flex-1">
          <View className="mb-4 flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: slide.accent }}>
              <Ionicons name={slide.icon} size={18} color="#fffaf0" />
            </View>
            <Text className="font-bold text-xs uppercase tracking-[1.6px] text-[#dccbaa]">{slide.kicker}</Text>
          </View>

          <Text className="font-display text-[38px] leading-[44px] text-[#f5ead8]">{slide.title}</Text>
          <Text className="mt-4 font-bold text-base leading-7 text-[#c9c0ae]">{slide.body}</Text>

          <View className="mt-6 flex-row gap-2">
            {SLIDES.map((_, i) => (
              <View key={i} className="h-2 rounded-pill" style={{ width: i === step ? 28 : 9, backgroundColor: i === step ? slide.accent : "rgba(245,234,216,.28)" }} />
            ))}
          </View>
        </View>

        <Pressable className="w-full items-center rounded-pill bg-clay-terracotta py-4 shadow-clay active:translate-y-[3px]" onPress={next}>
          <Text className="font-bold text-white">{step === SLIDES.length - 1 ? "Personalize my app" : "Continue"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
