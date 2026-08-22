/**
 * Canonical BoliVamos design tokens, sourced from the brand PRD (section 1).
 * This is the single source of truth — the Tailwind preset (web), the
 * NativeWind preset (mobile), and BRANDGUIDE/tokens/* are all generated
 * from these values. Do not hand-edit derived files; edit this one.
 */

export const colors = {
  // Primary brand colors (PRD 1.1)
  boliGreen: "#0B5D39",
  boliOrange: "#E07A2A",
  boliYellow: "#E5B824",
  boliRed: "#C83727",

  // Neutral palette (PRD 1.1)
  bgOffWhite: "#F7F5EE",
  charcoalDark: "#1E1E1E",
  mutedClayGray: "#4A4A4A",

  // Pure neutrals used for surfaces/contrast that aren't named in the PRD
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const fonts = {
  display: {
    family: "Bebas Neue",
    fallback: ["Impact", "sans-serif"],
  },
  body: {
    family: "Inter",
    fallback: ["system-ui", "-apple-system", "sans-serif"],
  },
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  "2xl": 40,
  "3xl": 56,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(30,30,30,.10)",
  md: "0 4px 12px rgba(30,30,30,.12)",
} as const;

export const tokens = {
  color: colors,
  font: fonts,
  fontSize: fontSizes,
  space: spacing,
  radius: radii,
  shadow: shadows,
} as const;

export type Tokens = typeof tokens;
