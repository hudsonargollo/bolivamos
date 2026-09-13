import { Image, type ImageStyle, type StyleProp } from "react-native";
import LOGO_SOURCE from "../assets/imgs/bolivibes-logo.webp";

export function BrandLogo({ width = 188, style }: { width?: number; style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      source={LOGO_SOURCE}
      accessibilityLabel="BoliVibes"
      resizeMode="contain"
      style={[{ width, height: width * 0.276 }, style]}
    />
  );
}
