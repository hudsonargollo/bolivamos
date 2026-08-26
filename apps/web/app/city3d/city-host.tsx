"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

// PRD §7.6: chrome strings stay bilingual EN/ES. This page doesn't get its
// own language toggle — it reads the same "bolivamos-lang" preference the
// hero scene's EN/ES pill writes to localStorage, so a visitor's choice on
// the homepage carries through to /city3d.
const STRINGS = {
  en: {
    search: "Search a place…",
    attractions: "Attractions",
    eatDrink: "Eat & drink",
    tours: "Tours",
    events: "Events",
    locateMe: "📍 Locate me",
    loading: "Loading places…",
    back: "← Back",
    freeRoamTitle: "Santa Cruz — free roam",
    freeRoamHint: "Drag to look around. WASD or arrow keys to walk (or the joystick, on touch). Look at a building to see what it is.",
    close: "Close",
    directions: "Get directions",
    eventsHere: "Events here",
    share: "Share",
  },
  es: {
    search: "Buscar un lugar…",
    attractions: "Atracciones",
    eatDrink: "Comer y beber",
    tours: "Tours",
    events: "Eventos",
    locateMe: "📍 Ubicarme",
    loading: "Cargando lugares…",
    back: "← Volver",
    freeRoamTitle: "Santa Cruz — recorrido libre",
    freeRoamHint: "Arrastra para mirar alrededor. WASD o flechas para caminar (o el joystick, en pantallas táctiles). Mira un edificio para ver qué es.",
    close: "Cerrar",
    directions: "Cómo llegar",
    eventsHere: "Eventos aquí",
    share: "Compartir",
  },
};

export default function CityHost() {
  // Plain window.location read in an effect rather than useSearchParams() --
  // this page is entirely client-rendered anyway, and avoids needing a
  // Suspense boundary just for one flag. embed=1 comes from the mobile
  // app's WebView (apps/mobile/app/(tabs)/map.tsx) — "back to home" is
  // redundant chrome inside a native tab that's already home.
  const [embedded, setEmbedded] = useState(false);
  const [lang, setLang] = useState<"en" | "es">("en");
  useEffect(() => {
    setEmbedded(new URLSearchParams(window.location.search).get("embed") === "1");
    try {
      if (localStorage.getItem("bolivamos-lang") === "es") setLang("es");
    } catch {
      // localStorage can throw in locked-down embeds (e.g. some WebViews) — EN default is fine.
    }
  }, []);
  const t = STRINGS[lang];

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#f5ead8",
          overflow: "hidden",
          fontFamily: "Figtree, -apple-system, sans-serif",
        }}
      >
        <canvas id="city-canvas" style={{ display: "block", width: "100%", height: "100%" }} />

        <div style={{ position: "fixed", left: 16, top: 16, width: 280, maxWidth: "calc(100vw - 150px)" }}>
          <input
            id="place-search"
            type="text"
            placeholder={t.search}
            autoComplete="off"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 14px",
              borderRadius: 10,
              border: "2px solid #c4703d",
              background: "#f5ead8",
              color: "#201e1d",
              fontFamily: "Figtree, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              outline: "none",
            }}
          />
          <div
            id="place-search-results"
            style={{
              display: "none",
              marginTop: 6,
              background: "#f5ead8",
              borderRadius: 10,
              boxShadow: "0 6px 20px rgba(32,30,29,0.25)",
              overflow: "hidden",
              maxHeight: 260,
              overflowY: "auto",
            }}
          />

          <div id="category-filters" style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {[
              { layer: "attraction", label: t.attractions, color: "#c4703d" },
              { layer: "eat_drink", label: t.eatDrink, color: "#c04a2f" },
              { layer: "tour", label: t.tours, color: "#8ba672" },
              { layer: "event", label: t.events, color: "#e3a52f" },
            ].map(({ layer, label, color }) => (
              <button
                key={layer}
                className="category-filter-btn"
                data-layer={layer}
                data-active="true"
                style={{
                  background: color,
                  color: "#f5ead8",
                  border: 0,
                  borderRadius: 20,
                  padding: "7px 13px",
                  fontFamily: "Figtree, sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  boxShadow: "0 2px 0 rgba(32,30,29,0.35)",
                  opacity: 1,
                }}
              >
                {label}
              </button>
            ))}
            <button
              id="locate-me-btn"
              style={{
                background: "#33302c",
                color: "#f5ead8",
                border: 0,
                borderRadius: 20,
                padding: "7px 13px",
                fontFamily: "Figtree, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                boxShadow: "0 2px 0 rgba(32,30,29,0.35)",
              }}
            >
              {t.locateMe}
            </button>
          </div>
        </div>

        <div
          id="crosshair-label"
          style={{
            display: "none",
            position: "fixed",
            left: "50%",
            top: "calc(50% + 28px)",
            transform: "translateX(-50%)",
            background: "rgba(32,30,29,0.85)",
            color: "#f5ead8",
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        />

        <div
          style={{
            position: "fixed",
            left: "50%",
            top: "50%",
            width: 6,
            height: 6,
            marginLeft: -3,
            marginTop: -3,
            borderRadius: "50%",
            background: "rgba(32,30,29,0.6)",
            pointerEvents: "none",
          }}
        />

        <div
          id="hud"
          style={{
            position: "fixed",
            left: 16,
            bottom: 16,
            color: "#7a6a52",
            fontSize: 13,
            fontWeight: 600,
            background: "rgba(255,255,255,0.75)",
            padding: "6px 12px",
            borderRadius: 8,
            pointerEvents: "none",
          }}
        >
          {t.loading}
        </div>

        {embedded ? null : (
          <a
            href="/"
            style={{
              position: "fixed",
              right: 16,
              top: 16,
              background: "#c4703d",
              color: "#f5ead8",
              padding: "9px 16px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              boxShadow: "0 3px 0 #8e4a20",
            }}
          >
            {t.back}
          </a>
        )}

        <div
          id="lock-overlay"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: "rgba(32,30,29,0.55)",
            color: "#f5ead8",
            cursor: "pointer",
            textAlign: "center",
            padding: 24,
          }}
        >
          <div style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 32 }}>{t.freeRoamTitle}</div>
          <div style={{ fontSize: 15, fontWeight: 600, maxWidth: 420 }}>{t.freeRoamHint}</div>
        </div>

        <div
          id="place-sheet-backdrop"
          style={{
            display: "none",
            position: "fixed",
            inset: 0,
            background: "rgba(32,30,29,0.4)",
          }}
        />
        <div
          id="place-sheet"
          style={{
            display: "none",
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            maxWidth: 480,
            margin: "0 auto",
            background: "#f5ead8",
            borderTop: "3px solid #c4703d",
            borderRadius: "16px 16px 0 0",
            padding: "20px 22px 24px",
            boxShadow: "0 -8px 30px rgba(32,30,29,0.25)",
          }}
        >
          <button
            id="place-sheet-close"
            aria-label={t.close}
            style={{
              position: "absolute",
              right: 14,
              top: 12,
              border: 0,
              background: "transparent",
              fontSize: 20,
              color: "#7a6a52",
              cursor: "pointer",
              lineHeight: 1,
              padding: 6,
            }}
          >
            ×
          </button>
          <div id="place-sheet-name" style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 26, color: "#201e1d" }} />
          <div id="place-sheet-meta" style={{ fontFamily: "Figtree, sans-serif", fontWeight: 600, color: "#7a6a52", marginTop: 4 }} />
          <div id="place-sheet-rating" style={{ fontFamily: "Figtree, sans-serif", fontWeight: 700, color: "#c4703d", marginTop: 8, fontSize: 15 }} />
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <a
              id="place-sheet-maps"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#c4703d",
                color: "#f5ead8",
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                boxShadow: "0 3px 0 #8e4a20",
              }}
            >
              {t.directions}
            </a>
            <button
              id="place-sheet-events"
              style={{
                display: "none",
                background: "#8ba672",
                color: "#f5ead8",
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                border: 0,
                cursor: "pointer",
                boxShadow: "0 3px 0 #5c7245",
              }}
            >
              {t.eventsHere}
            </button>
            <button
              id="place-sheet-share"
              style={{
                background: "#33302c",
                color: "#f5ead8",
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                border: 0,
                cursor: "pointer",
                boxShadow: "0 3px 0 #1a1815",
              }}
            >
              {t.share}
            </button>
          </div>
        </div>

        <div
          id="joystick-base"
          style={{
            display: "none",
            position: "fixed",
            right: 28,
            bottom: 28,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(32,30,29,0.28)",
            border: "2px solid rgba(245,234,216,0.5)",
            touchAction: "none",
          }}
        >
          <div
            id="joystick-stick"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 44,
              height: 44,
              marginLeft: -22,
              marginTop: -22,
              borderRadius: "50%",
              background: "rgba(196,112,61,0.9)",
              boxShadow: "0 3px 0 #8e4a20",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      <Script src="/bolivamos/city-scene.js" type="module" strategy="afterInteractive" />
    </>
  );
}
