/**
 * Plain-CommonJS mirror of ./src/tailwind-preset.ts, used specifically by
 * tailwind.config.js files (apps/web, apps/mobile) — Tailwind's config
 * loader runs under plain Node and can't reliably parse a workspace
 * package's TypeScript source at require-time. Keep these values in sync
 * with ./src/tokens.ts if the palette/fonts/radii/shadows ever change.
 */
module.exports = {
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
      },
      fontFamily: {
        display: ["Anton", "Impact", "sans-serif"],
        body: ["Archivo", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: { sm: "4px", md: "8px", lg: "16px", pill: "999px" },
      boxShadow: {
        sm: "0 1px 2px rgba(51,48,44,.10)",
        md: "0 4px 12px rgba(51,48,44,.12)",
      },
    },
  },
};
