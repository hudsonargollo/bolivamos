import { Image, type ImageStyle, type StyleProp } from "react-native";
import LOGO_SOURCE from "../assets/images/logo-clay.webp";

export function BrandLogo({ width = 188, style }: { width?: number; style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      source={LOGO_SOURCE}
      accessibilityLabel="BoliVibes"
      resizeMode="contain"
      style={[{ width, height: width * 0.35 }, style]}
    />
  );
}
