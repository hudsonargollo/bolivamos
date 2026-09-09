import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { SunMark } from "@/components/SunMark";
import { useT, type StringKey } from "@/lib/i18n";

const BAR_HEIGHTS = [24, 42, 18, 52, 30, 46, 22, 36];
const BAR_COLORS = ["#c4703d", "#7a8a5e", "#e3a52f", "#b8492e", "#d0824a", "#8ba672", "#e2792f", "#97b17e"];

const SLIDES: { h1: StringKey; h2: StringKey; p: StringKey }[] = [
  { h1: "slide1H1", h2: "slide1H2", p: "slide1P" },
  { h1: "slide2H1", h2: "slide2H2", p: "slide2P" },
  { h1: "slide3H1", h2: "slide3H2", p: "slide3P" },
];

export default function OnboardingSlides() {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];

  function next() {
    if (step < SLIDES.length - 1) setStep(step + 1);
    else router.push("/(onboarding)/preferences");
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#232840" }}>
      <View className="flex-1 items-center justify-center gap-7 px-9 pt-16">
        <View>
          <SunMark size={168} ring="#f5ead8" spin />
        </View>
        <View className="h-14 flex-row items-end gap-1">
          {BAR_HEIGHTS.map((h, i) => (
            <View key={i} style={{ width: 16, height: h, backgroundColor: BAR_COLORS[i], borderTopLeftRadius: 4, borderTopRightRadius: 4, opacity: 0.9 }} />
          ))}
        </View>
        <View className="items-center">
          <Text className="text-center font-display text-4xl leading-tight text-[#f5ead8]">
            {t(slide.h1)}
            {"\n"}
            <Text className="text-[#e3a52f]">{t(slide.h2)}</Text>
          </Text>
          <Text className="mt-3 text-center font-bold text-sm leading-6 text-[#c9c0ae]">{t(slide.p)}</Text>
        </View>
      </View>
      <View className="items-center gap-4 px-6 pb-10 pt-4">
        <View className="flex-row gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className="h-2 rounded-pill"
              style={{ width: i === step ? 22 : 8, backgroundColor: i === step ? "#c4703d" : "rgba(245,234,216,.3)" }}
            />
          ))}
        </View>
        <Pressable className="w-full items-center rounded-pill bg-clay-terracotta py-4 shadow-clay active:translate-y-[3px]" onPress={next}>
          <Text className="font-bold text-white">{step === SLIDES.length - 1 ? t("letsGo") : t("continueLabel")}</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(onboarding)/preferences")}>
          <Text className="font-bold text-sm text-[#a99f8d]">{t("skip")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
