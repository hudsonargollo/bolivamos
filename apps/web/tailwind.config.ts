import type { Config } from "tailwindcss";
import tailwindPreset from "@bolivamos/design-tokens/tailwind-preset";

const config: Config = {
  presets: [tailwindPreset as Config],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
};

export default config;
