/**
 * Plain-CommonJS mirror of ./src/tailwind-preset.ts, used specifically by
 * tailwind.config.js files (apps/web, apps/mobile) — Tailwind's config
 * loader runs under plain Node and can't reliably parse a workspace
 * package's TypeScript source at require-time. Keep these values in sync
 * with ./src/tokens.ts if the palette/fonts/radii/shadows ever change.
 */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "boli-green": "#2F5D3E",
        "boli-orange": "#E2792F",
        "boli-yellow": "#E3A52F",
        "boli-red": "#C04A2F",
        "boli-sage": "#8BA672",
        "bg-off-white": "#F4EEE2",
        paper: "#FDFAF3",
        "charcoal-dark": "#33302C",
        "muted-clay-gray": "#5B564F",
        // "Clay Maximal" terracotta system — ported from admin.css's
        // --a-orange* (mobile-v2 reskin), new primary CTA color.
        "clay-terracotta-lt": "#D0824A",
        "clay-terracotta": "#C4703D",
        "clay-terracotta-dk": "#B4633A",
        "clay-terracotta-shadow": "#8E4A20",
        "clay-sage-lt": "#97B17E",
        "clay-sage": "#7A8A5E",
        "clay-sage-dk": "#6F8955",
        "clay-sage-shadow": "#55613F",
        "clay-charcoal-lt": "#4A443C",
        "clay-charcoal-dk": "#3A352F",
        "clay-charcoal-shadow": "#1C1A17",
        "clay-danger-lt": "#D1684A",
        "clay-danger": "#B8492E",
        "clay-danger-dk": "#9C3C25",
        "clay-danger-shadow": "#6E2415",
        // Dark-mode palette (mobile-v2 prototype's real dark theme values).
        "dark-bg": "#1D1A17",
        "dark-bg2": "#141210",
        "dark-card1": "#2B2723",
        "dark-card2": "#241F1B",
        "dark-card-shadow": "#0F0D0B",
        "dark-ink": "#F5EAD8",
        "dark-ink2": "#E8DCC2",
        "dark-sub": "#B8A98C",
        "dark-muted": "#8A7C63",
      },
      fontFamily: {
        display: ["Caprasimo", "Georgia", "serif"],
        body: ["Archivo", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: { sm: "4px", md: "8px", lg: "16px", xl: "22px", sheet: "28px", pill: "999px" },
      boxShadow: {
        sm: "0 1px 2px rgba(51,48,44,.10)",
        md: "0 4px 12px rgba(51,48,44,.12)",
        clay: "inset 0 2px 0 rgba(255,246,230,.35), inset 0 -2px 0 rgba(74,36,12,.25), 0 3px 0 #8E4A20, 0 6px 10px rgba(60,35,15,.22)",
        "clay-sage": "inset 0 2px 0 rgba(255,246,230,.3), inset 0 -2px 0 rgba(30,40,15,.22), 0 3px 0 #55613F, 0 6px 10px rgba(40,50,20,.2)",
        "clay-charcoal": "inset 0 2px 0 rgba(255,246,230,.2), inset 0 -2px 0 rgba(0,0,0,.3), 0 3px 0 #1C1A17, 0 6px 10px rgba(0,0,0,.25)",
        "clay-danger": "inset 0 2px 0 rgba(255,246,230,.3), inset 0 -2px 0 rgba(50,10,5,.3), 0 3px 0 #6E2415, 0 6px 10px rgba(50,15,10,.25)",
      },
    },
  },
};
