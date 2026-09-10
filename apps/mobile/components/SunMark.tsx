import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// Same flat sun-mark source used across the brand — see
// BRANDGUIDE/assets/sun-mark.svg and apps/web/public/bolivibes/scene.js's
// 3D construction of the same 12-ray pattern (ported here for the mobile
// onboarding carousel and BoliPass card, which needed a lightweight, no-
// WebView, no-three.js version).
const RAY_COLORS = [
  "#c04a2f", "#e3a52f", "#8ba672", "#e2792f", "#e3a52f", "#c04a2f",
  "#8ba672", "#e3a52f", "#c04a2f", "#e2792f", "#8ba672", "#e3a52f",
];

export function SunMark({ size = 40, ring = "#33302c", spin = false }: { size?: number; ring?: string; spin?: boolean }) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!spin) return;
    const loop = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 60000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin, rotation]);

  const spinStyle = spin
    ? { transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }
    : undefined;

  return (
    <AnimatedSvg width={size} height={size} viewBox="-120 -120 240 240" style={spinStyle}>
      {RAY_COLORS.map((color, i) => (
        <Path key={i} d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill={color} transform={`rotate(${i * 30})`} />
      ))}
      <Circle r={44} fill="none" stroke={ring} strokeWidth={14} />
    </AnimatedSvg>
  );
}
