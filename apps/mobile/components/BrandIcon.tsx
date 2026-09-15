import { Image, type ImageStyle, type StyleProp } from "react-native";
import ICON_SOURCE from "../assets/images/logo-icon.webp";

export function BrandIcon({ size = 132, style }: { size?: number; style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      source={ICON_SOURCE}
      accessibilityLabel="BoliVibes icon"
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}
