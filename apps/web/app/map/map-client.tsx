"use client";

import { useMemo, useState, useEffect } from "react";
import type { PlaceFeature, PlaceFeatureCollection, PlaceLayer } from "@bolivibes/api-schema";
import OsmMapWrapper from "./components/osm-map-dynamic";

const CENTER = { lat: -17.7834, lng: -63.1821 };
const ALL_LAYERS: PlaceLayer[] = ["attraction", "eat_drink", "tour", "transfer", "event"];

const STRINGS = {
  en: {
    title: "Navigate Santa Cruz",
    subtitle: "BoliVibes pins, featured venues, partner businesses, and city highlights.",
    search: "Search places…",
    all: "All",
    attraction: "Highlights",
    eat_drink: "Eat & drink",
    tour: "Tours",
    transfer: "Transfers",
    event: "Events",
    featured: "Featured",
    bolivibesPick: "BoliVibes pick",
    loading: "Loading the city map…",
    directions: "Navigate",
    share: "Share",
    close: "Close",
    openGoogle: "Open in Google Maps",
    noResults: "No matching places yet.",
    approx: "Seed demo pins are approximate until QA verifies the full directory.",
  },
  es: {
    title: "Navega Santa Cruz",
    subtitle: "Pines de BoliVibes, locales destacados, negocios aliados y highlights de la ciudad.",
    search: "Buscar lugares…",
    all: "Todo",
    attraction: "Highlights",
    eat_drink: "Comer y beber",
    tour: "Tours",
    transfer: "Transfers",
    event: "Eventos",
    featured: "Destacado",
    bolivibesPick: "BoliVibes pick",
    loading: "Cargando el mapa de la ciudad…",
    directions: "Navegar",
    share: "Compartir",
    close: "Cerrar",
    openGoogle: "Abrir en Google Maps",
    noResults: "Aún no hay lugares que coincidan.",
    approx: "Los pines de demo son aproximados hasta que QA verifique el directorio.",
  },
} as const;

function layerColor(layer: PlaceLayer) {
  switch (layer) {
    case "attraction": return "#c4703d";
    case "eat_drink": return "#e5b824";
    case "tour": return "#b8492e";
    case "transfer": return "#7a8a5e";
    case "event": return "#8e4a20";
    default: return "#33302c";
  }
}

const DISTRICTS = [
  { key: "centro", label: "Centro", center: { lat: -17.7833, lng: -63.1821 }, color: "#d0824a", zoom: 16.5 },
  { key: "equipetrol", label: "Equipetrol", center: { lat: -17.7600, lng: -63.1970 }, color: "#97b17e", zoom: 16 },
  { key: "urubo", label: "Urubó", center: { lat: -17.7470, lng: -63.2200 }, color: "#b8492e", zoom: 15.5 },
];

function isFeatured(feature: PlaceFeature) {
  return feature.properties.rating && feature.properties.rating >= 4.8;
}

export default function MapClient({ lang = "en" }: { lang?: "en" | "es" }) {
  const t = STRINGS[lang];
  
  const [features, setFeatures] = useState<PlaceFeature[]>([]);
  const [activeLayers, setActiveLayers] = useState<Set<PlaceLayer>>(new Set(ALL_LAYERS));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PlaceFeature | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetch("/api/places")
      .then((res) => res.json())
      .then((data) => {
        setFeatures((data as PlaceFeatureCollection).features);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const filteredFeatures = useMemo(() => {
    const q = query.toLowerCase().trim();
    return features.filter((feature) => {
      if (!activeLayers.has(feature.properties.layer)) return false;
      if (q) {
        if (!feature.properties.name.toLowerCase().includes(q) &&
            !feature.properties.category?.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const aFeat = isFeatured(a) ? 1 : 0;
      const bFeat = isFeatured(b) ? 1 : 0;
      return bFeat - aFeat;
    });
  }, [features, activeLayers, query]);

  function flyTo(feature: PlaceFeature) {
    setSelected(feature);
    // Note: To pan the map we'd need to pass a method into OsmMapWrapper or lift the map controls state up.
    // For now, selecting it visually highlights it.
  }

  function toggleLayer(layer: PlaceLayer) {
    setActiveLayers((current) => {
      const next = new Set(current);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }

  function flyDistrict(district: (typeof DISTRICTS)[number]) {
    // In the future: hook this up to R3F camera
  }

  function layerLabel(layer: PlaceLayer) {
    if (layer === "street_zone") return lang === "es" ? "Zonas" : "Zones";
    return t[layer];
  }

  function sharePlace(feature: PlaceFeature) {
    const url = `${window.location.origin}/map?place=${feature.properties.id}`;
    if (navigator.share) navigator.share({ title: feature.properties.name, url }).catch(() => undefined);
    else navigator.clipboard?.writeText(url).catch(() => undefined);
  }

  return (
    <main className="bv-gmap-shell">
      <div className="bv-gmap-canvas" aria-label="BoliVibes 3D city navigation">
        <OsmMapWrapper places={filteredFeatures} activePlace={selected} onPlaceSelect={setSelected} />
      </div>

      <section className="bv-gmap-panel" aria-label="Map controls">
        <div className="bv-gmap-brand">
          <img src="/api/assets/brand/logo-icon.webp" alt="BoliVibes" onError={(e) => { (e.target as HTMLImageElement).src = "/imgs/logo-icon.webp"; }} />
          <div>
            <p>{t.title}</p>
            <span>{t.subtitle}</span>
          </div>
        </div>

        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="bv-gmap-search" />

        <div className="bv-gmap-layer-row">
          {ALL_LAYERS.map((layer) => (
            <button key={layer} type="button" className={activeLayers.has(layer) ? "active" : ""} onClick={() => toggleLayer(layer)}>
              <span style={{ background: layerColor(layer) }} />{layerLabel(layer)}
            </button>
          ))}
        </div>

        <div className="bv-gmap-districts">
          {DISTRICTS.map((district) => (
            <button key={district.key} type="button" onClick={() => flyDistrict(district)}>
              <span style={{ background: district.color }} />{district.label}
            </button>
          ))}
        </div>

        <div className="bv-gmap-results">
          {filteredFeatures.slice(0, 8).map((feature) => (
            <button key={feature.properties.id} type="button" onClick={() => flyTo(feature)} className={isFeatured(feature) ? "featured" : ""}>
              {isFeatured(feature) ? <img src="/api/assets/brand/logo-icon.webp" alt="BoliVibes" onError={(e) => { (e.target as HTMLImageElement).src = "/imgs/logo-icon.webp"; }} /> : <span style={{ background: layerColor(feature.properties.layer) }} />}
              <div>
                <strong>{feature.properties.name}</strong>
                <small>{feature.properties.district ?? layerLabel(feature.properties.layer)} {isFeatured(feature) ? `· ${t.featured}` : ""}</small>
              </div>
            </button>
          ))}
          {filteredFeatures.length === 0 ? <p className="bv-gmap-empty">{t.noResults}</p> : null}
        </div>
      </section>

      {selected ? (
        <aside className="bv-gmap-sheet" aria-live="polite">
          <button type="button" className="bv-gmap-close" onClick={() => setSelected(null)} aria-label={t.close}>×</button>
          <div className="bv-gmap-sheet-head">
            {isFeatured(selected) ? <img src="/api/assets/brand/logo-icon.webp" alt="BoliVibes" onError={(e) => { (e.target as HTMLImageElement).src = "/imgs/logo-icon.webp"; }} /> : null}
            <div>
              <p>{isFeatured(selected) ? t.bolivibesPick : layerLabel(selected.properties.layer)}</p>
              <h1>{selected.properties.name}</h1>
            </div>
          </div>
          <div className="bv-gmap-meta">
            <span>{selected.properties.district ?? "Santa Cruz"}</span>
            {selected.properties.category ? <span>{selected.properties.category}</span> : null}
            {selected.properties.rating ? <span>★ {selected.properties.rating}</span> : null}
          </div>
          {selected.properties.description ? <p className="bv-gmap-description">{selected.properties.description}</p> : null}
          <p className="bv-gmap-note">{selected.properties.verified ? selected.properties.address : t.approx}</p>
          <div className="bv-gmap-actions">
            <a className="bv-btn" href={selected.properties.googleMapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${selected.geometry.coordinates[1]},${selected.geometry.coordinates[0]}`} target="_blank" rel="noreferrer">{t.directions}</a>
            <button className="bv-btn bv-btn-sage" type="button" onClick={() => sharePlace(selected)}>{t.share}</button>
          </div>
        </aside>
      ) : null}

      <style jsx global>{`
        .bv-gmap-shell { position: fixed; inset: 0; overflow: hidden; background: #e6d7bd; color: #201e1d; font-family: Figtree, system-ui, sans-serif; }
        .bv-gmap-canvas { position: absolute; inset: 0; }
        .bv-gmap-panel { position: absolute; z-index: 3; left: 16px; top: 16px; width: min(380px, calc(100vw - 32px)); max-height: calc(100vh - 112px); overflow: auto; padding: 14px; border: 1px solid rgba(122,106,82,.22); border-radius: 28px; background: rgba(247,241,228,.94); box-shadow: 0 16px 40px rgba(32,30,29,.22), 0 4px 0 #d9c8a4; backdrop-filter: blur(14px); }
        .bv-gmap-brand { display: flex; gap: 12px; align-items: center; }
        .bv-gmap-brand img { width: 46px; height: 46px; border-radius: 15px; box-shadow: 0 3px 0 #8e4a20; }
        .bv-gmap-brand p { margin: 0; font-family: Caprasimo, Georgia, serif; font-size: 23px; line-height: 1.05; }
        .bv-gmap-brand span { display: block; margin-top: 4px; color: #7a6a52; font-size: 12px; font-weight: 750; line-height: 1.35; }
        .bv-gmap-search { width: 100%; min-height: 46px; box-sizing: border-box; margin-top: 14px; padding: 0 14px; border-radius: 999px; border: 2px solid #c4703d; background: #fdfaf3; color: #201e1d; font: 800 14px Figtree, system-ui, sans-serif; outline: none; }
        .bv-gmap-search:focus { box-shadow: 0 0 0 4px rgba(196,112,61,.22); }
        .bv-gmap-layer-row, .bv-gmap-districts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .bv-gmap-layer-row button, .bv-gmap-districts button { min-height: 38px; display: inline-flex; align-items: center; gap: 7px; border: 0; border-radius: 999px; padding: 8px 12px; background: linear-gradient(#fdfaf3, #f0e5cd); box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 2px 0 #d9c8a4; color: #33302c; cursor: pointer; font-size: 12px; font-weight: 850; }
        .bv-gmap-layer-row button span, .bv-gmap-districts button span { width: 9px; height: 9px; border-radius: 999px; }
        .bv-gmap-layer-row button.active { background: linear-gradient(#d0824a, #c4703d 45%, #b4633a); color: #f7f1e4; box-shadow: inset 0 2px 0 rgba(255,246,230,.35), 0 2px 0 #8e4a20; }
        .bv-gmap-results { display: grid; gap: 8px; margin-top: 14px; }
        .bv-gmap-results button { min-height: 58px; display: flex; align-items: center; gap: 11px; width: 100%; border: 0; border-radius: 18px; padding: 10px; background: rgba(255,255,255,.7); text-align: left; cursor: pointer; }
        .bv-gmap-results button.featured { background: rgba(196,112,61,.14); outline: 1px solid rgba(196,112,61,.24); }
        .bv-gmap-results button > span { flex: 0 0 auto; width: 16px; height: 16px; border-radius: 6px; box-shadow: 0 2px 0 #8e4a20; }
        .bv-gmap-results img { width: 30px; height: 30px; border-radius: 10px; box-shadow: 0 2px 0 #8e4a20; }
        .bv-gmap-results strong { display: block; color: #201e1d; font-size: 13px; line-height: 1.2; }
        .bv-gmap-results small { display: block; margin-top: 3px; color: #7a6a52; font-size: 11px; font-weight: 800; }
        .bv-gmap-empty { margin: 0; color: #7a6a52; font-size: 13px; font-weight: 800; }
        .bv-gmap-sheet { position: absolute; z-index: 5; right: 16px; bottom: 88px; width: min(420px, calc(100vw - 32px)); padding: 18px; border-radius: 28px; background: #f7f1e4; box-shadow: 0 18px 45px rgba(32,30,29,.28), 0 4px 0 #d9c8a4; }
        .bv-gmap-close { position: absolute; right: 12px; top: 10px; width: 40px; height: 40px; border: 0; border-radius: 999px; background: rgba(122,106,82,.12); color: #33302c; cursor: pointer; font-size: 24px; font-weight: 800; }
        .bv-gmap-sheet-head { display: flex; gap: 12px; padding-right: 42px; align-items: center; }
        .bv-gmap-sheet-head img { width: 46px; height: 46px; border-radius: 15px; box-shadow: 0 3px 0 #8e4a20; }
        .bv-gmap-sheet-head p { margin: 0 0 5px; color: #8f4225; font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
        .bv-gmap-sheet-head h1 { margin: 0; font-family: Caprasimo, Georgia, serif; font-size: clamp(24px, 5vw, 34px); line-height: 1.05; }
        .bv-gmap-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .bv-gmap-meta span { border-radius: 999px; padding: 7px 11px; background: rgba(122,106,82,.12); color: #7a6a52; font-size: 12px; font-weight: 850; }
        .bv-gmap-description, .bv-gmap-note { color: #7a6a52; font-size: 13px; font-weight: 700; line-height: 1.45; }
        .bv-gmap-actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
        @media (max-width: 720px) { .bv-gmap-panel { top: 10px; left: 10px; width: calc(100vw - 20px); max-height: 45vh; border-radius: 24px; } .bv-gmap-sheet { left: 10px; right: 10px; bottom: 84px; width: auto; } .bv-gmap-status { left: 12px; bottom: 82px; } }
      `}</style>
    </main>
  );
}

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }
}
