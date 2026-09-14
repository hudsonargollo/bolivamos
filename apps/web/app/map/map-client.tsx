"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ThreeJSOverlayView } from "@googlemaps/three";
import type { PlaceFeature, PlaceFeatureCollection, PlaceLayer } from "@bolivibes/api-schema";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";

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
    missingKey: "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the Google Maps 3D map.",
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
    missingKey: "Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para activar el mapa 3D de Google Maps.",
    directions: "Navegar",
    share: "Compartir",
    close: "Cerrar",
    openGoogle: "Abrir en Google Maps",
    noResults: "Aún no hay lugares con esa búsqueda.",
    approx: "Los pines demo son aproximados hasta que QA verifique el directorio completo.",
  },
};

const DISTRICTS = [
  { key: "Centro", label: "Centro", color: "#33302c", center: { lat: -17.7834, lng: -63.1821 }, zoom: 16 },
  { key: "Equipetrol", label: "Equipetrol", color: "#8ba672", center: { lat: -17.7568, lng: -63.2011 }, zoom: 15 },
  { key: "Parque Urbano", label: "Parque Urbano", color: "#5c7245", center: { lat: -17.7896, lng: -63.1893 }, zoom: 15 },
  { key: "Zoo", label: "Zoo", color: "#7a8a5e", center: { lat: -17.7593, lng: -63.1955 }, zoom: 15 },
  { key: "Las Brisas", label: "Las Brisas", color: "#b99a55", center: { lat: -17.7534, lng: -63.155 }, zoom: 15 },
  { key: "La Ramada", label: "La Ramada", color: "#c04a2f", center: { lat: -17.794, lng: -63.1905 }, zoom: 15 },
] as const;

const SEED_FEATURES: PlaceFeature[] = [
  seed("plaza-24-de-septiembre", "Plaza 24 de Septiembre", "attraction", "Centro", -17.7834, -63.1821, true),
  seed("catedral-de-santa-cruz", "Catedral de Santa Cruz", "attraction", "Centro", -17.784, -63.1825, true),
  seed("manzana-1", "Manzana 1 Espacio de Arte", "attraction", "Centro", -17.7829, -63.1815, false),
  seed("parque-el-arenal", "Parque El Arenal", "attraction", "Centro", -17.7789, -63.1746, false),
  seed("parque-urbano-central", "Parque Urbano Central", "attraction", "Parque Urbano", -17.7896, -63.1893, true),
  seed("zoologico-municipal", "Zoológico Municipal", "attraction", "Zoo", -17.7593, -63.1955, false),
  seed("ventura-mall", "Ventura Mall", "eat_drink", "Equipetrol", -17.7568, -63.2011, true),
  seed("las-brisas-centro-comercial", "Las Brisas Centro Comercial", "eat_drink", "Las Brisas", -17.7534, -63.155, true),
  seed("bolitours-santa-cruz", "BOLITOURS Santa Cruz", "tour", "Centro", -17.7832, -63.1808, true),
];

function seed(id: string, name: string, layer: PlaceLayer, district: string, lat: number, lng: number, featured: boolean): PlaceFeature {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lng, lat] },
    properties: {
      id,
      name,
      layer,
      category: featured ? "BoliVibes featured" : null,
      district,
      rating: null,
      reviews: null,
      price: null,
      description: featured ? "Featured place highlighted with the BoliVibes mark." : null,
      address: null,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} Santa Cruz de la Sierra Bolivia`)}`,
      websiteUrl: null,
      instagramUrl: null,
      tiktokUrl: null,
      phone: null,
      regional: false,
      venueId: featured ? id : null,
      source: "manual",
      verified: false,
    },
  };
}

function layerColor(layer: PlaceLayer) {
  switch (layer) {
    case "eat_drink":
      return "#c04a2f";
    case "tour":
    case "transfer":
      return "#8ba672";
    case "event":
      return "#e3a52f";
    default:
      return "#c4703d";
  }
}

function isFeatured(feature: PlaceFeature) {
  return Boolean(feature.properties.venueId || feature.properties.category?.toLowerCase().includes("featured") || feature.properties.layer === "event");
}

function loadGoogleMaps() {
  if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error("missing-key"));
  if (window.google?.maps) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>("script[data-bolivibes-google-maps]");
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("google-maps-load-failed")), { once: true });
    });
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.dataset.bolivibesGoogleMaps = "true";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("google-maps-load-failed"));
    document.head.appendChild(script);
  });
}

function makeMarker(feature: PlaceFeature) {
  const featured = isFeatured(feature);
  const color = new THREE.Color(featured ? "#f7f1e4" : layerColor(feature.properties.layer));
  const rim = new THREE.Color(featured ? "#c4703d" : "#8e4a20");
  const group = new THREE.Group();
  group.userData.feature = feature;
  group.userData.featured = featured;

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(featured ? 7 : 5, featured ? 5 : 3.5, featured ? 48 : 34, 18),
    new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.05 }),
  );
  stem.geometry.translate(0, featured ? 24 : 17, 0);
  stem.userData.feature = feature;
  group.add(stem);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(featured ? 16 : 11, 26, 18),
    new THREE.MeshStandardMaterial({ color, emissive: featured ? rim : new THREE.Color("#000000"), emissiveIntensity: featured ? 0.22 : 0, roughness: 0.66 }),
  );
  head.position.y = featured ? 54 : 38;
  head.userData.feature = feature;
  group.add(head);

  if (featured) {
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(21, 2.5, 10, 32),
      new THREE.MeshBasicMaterial({ color: "#ffd696", transparent: true, opacity: 0.72 }),
    );
    halo.position.y = 54;
    halo.rotation.x = Math.PI / 2;
    halo.userData.feature = feature;
    group.add(halo);

    const icon = new THREE.Mesh(
      new THREE.CircleGeometry(9, 24),
      new THREE.MeshBasicMaterial({ map: null, color: "#c4703d" }),
    );
    icon.position.y = 55;
    icon.position.z = 0.5;
    icon.rotation.x = -Math.PI / 2;
    icon.userData.feature = feature;
    group.add(icon);
  }

  return group;
}

export default function MapClient() {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<ThreeJSOverlayView | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<THREE.Group[]>([]);
  const [lang, setLang] = useState<"en" | "es">("en");
  const [status, setStatus] = useState<"loading" | "ready" | "missing-key" | "error">("loading");
  const [features, setFeatures] = useState<PlaceFeature[]>(SEED_FEATURES);
  const [activeLayers, setActiveLayers] = useState<Set<PlaceLayer>>(() => new Set(ALL_LAYERS));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PlaceFeature | null>(null);

  const t = STRINGS[lang];
  const filteredFeatures = useMemo(() => {
    const term = query.trim().toLowerCase();
    return features.filter((feature) => {
      if (!activeLayers.has(feature.properties.layer)) return false;
      if (!term) return true;
      return [feature.properties.name, feature.properties.category, feature.properties.district]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [activeLayers, features, query]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bolivibes-lang");
      if (stored === "es") setLang("es");
    } catch {
      // localStorage can be unavailable in locked-down WebViews.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/places")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("places-failed"))))
      .then((collection) => {
        const placeCollection = collection as PlaceFeatureCollection;
        if (!cancelled && placeCollection.features.length > 0) setFeatures(placeCollection.features);
      })
      .catch(() => {
        if (!cancelled) setFeatures(SEED_FEATURES);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;
        const map = new google.maps.Map(mapRef.current, {
          center: CENTER,
          zoom: 15,
          minZoom: 12,
          maxZoom: 19,
          mapId: GOOGLE_MAPS_MAP_ID,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          heading: 0,
          tilt: 67.5,
          backgroundColor: "#e6d7bd",
        });
        mapInstanceRef.current = map;

        const overlay = new ThreeJSOverlayView({ map, anchor: CENTER, upAxis: "Y" });
        overlay.scene.add(new THREE.AmbientLight(0xfff2d8, 2.1));
        const sun = new THREE.DirectionalLight(0xffdf9a, 2.4);
        sun.position.set(140, 240, 80);
        overlay.scene.add(sun);
        overlayRef.current = overlay;

        const mousePosition = new THREE.Vector2(1000, 1000);
        const updatePointer = (event: MouseEvent | PointerEvent) => {
          const bounds = map.getDiv().getBoundingClientRect();
          const x = event.clientX - bounds.left;
          const y = event.clientY - bounds.top;
          mousePosition.x = 2 * (x / bounds.width) - 1;
          mousePosition.y = 1 - 2 * (y / bounds.height);
          overlay.requestRedraw();
        };
        map.getDiv().addEventListener("pointermove", updatePointer);
        map.getDiv().addEventListener("click", (event) => {
          updatePointer(event);
          const hit = overlay.raycast(mousePosition).find((item: THREE.Intersection<THREE.Object3D>) => item.object.userData.feature);
          if (hit?.object.userData.feature) setSelected(hit.object.userData.feature as PlaceFeature);
        });

        overlay.onBeforeDraw = () => {
          const hit = overlay.raycast(mousePosition).find((item: THREE.Intersection<THREE.Object3D>) => item.object.userData.feature);
          markersRef.current.forEach((marker) => {
            const target = hit?.object.userData.feature?.properties.id === marker.userData.feature.properties.id;
            const base = marker.userData.featured ? 1.1 : 1;
            marker.scale.setScalar(target ? base * 1.18 : base);
          });
        };

        setStatus("ready");
      })
      .catch((error: Error) => setStatus(error.message === "missing-key" ? "missing-key" : "error"));

    return () => {
      cancelled = true;
      overlayRef.current?.setMap(null);
      overlayRef.current = null;
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    markersRef.current.forEach((marker) => overlay.scene.remove(marker));
    markersRef.current = filteredFeatures.map((feature) => {
      const marker = makeMarker(feature);
      const [lng, lat] = feature.geometry.coordinates;
      marker.position.copy(overlay.latLngAltitudeToVector3({ lat, lng, altitude: 0 }));
      overlay.scene.add(marker);
      return marker;
    });
    overlay.requestRedraw();
  }, [filteredFeatures]);

  function flyTo(feature: PlaceFeature) {
    const [lng, lat] = feature.geometry.coordinates;
    const map = mapInstanceRef.current;
    map?.moveCamera({ center: { lat, lng }, zoom: 17, tilt: 67.5, heading: 0 });
    setSelected(feature);
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
    mapInstanceRef.current?.moveCamera({ center: district.center, zoom: district.zoom, tilt: 67.5, heading: 0 });
  }

  function layerLabel(layer: PlaceLayer) {
    if (layer === "street_zone") return lang === "es" ? "Zonas" : "Zones";
    return t[layer];
  }

  function sharePlace(feature: PlaceFeature) {
    const url = `${window.location.origin}/map?place=${feature.properties.id}`;
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "share", title: feature.properties.name, url }));
      return;
    }
    if (navigator.share) navigator.share({ title: feature.properties.name, url }).catch(() => undefined);
    else navigator.clipboard?.writeText(url).catch(() => undefined);
  }

  return (
    <main className="bv-gmap-shell">
      <div ref={mapRef} className="bv-gmap-canvas" aria-label="BoliVibes Google Maps city navigation" />

      <section className="bv-gmap-panel" aria-label="Map controls">
        <div className="bv-gmap-brand">
          <img src="/imgs/bolivibes-icon.webp" alt="" />
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
              {isFeatured(feature) ? <img src="/imgs/bolivibes-icon.webp" alt="" /> : <span style={{ background: layerColor(feature.properties.layer) }} />}
              <div>
                <strong>{feature.properties.name}</strong>
                <small>{feature.properties.district ?? layerLabel(feature.properties.layer)} {isFeatured(feature) ? `· ${t.featured}` : ""}</small>
              </div>
            </button>
          ))}
          {filteredFeatures.length === 0 ? <p className="bv-gmap-empty">{t.noResults}</p> : null}
        </div>
      </section>

      <div className="bv-gmap-status" data-state={status}>{status === "missing-key" ? t.missingKey : status === "ready" ? `${filteredFeatures.length} pins` : status === "error" ? "Google Maps failed to load." : t.loading}</div>

      {selected ? (
        <aside className="bv-gmap-sheet" aria-live="polite">
          <button type="button" className="bv-gmap-close" onClick={() => setSelected(null)} aria-label={t.close}>×</button>
          <div className="bv-gmap-sheet-head">
            {isFeatured(selected) ? <img src="/imgs/bolivibes-icon.webp" alt="" /> : null}
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
        .bv-gmap-canvas > div { filter: sepia(.2) saturate(.9) hue-rotate(-8deg) brightness(1.02) contrast(.96); }
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
        .bv-gmap-status { position: absolute; z-index: 4; left: 18px; bottom: 86px; max-width: calc(100vw - 36px); border-radius: 999px; padding: 8px 13px; background: rgba(32,30,29,.82); color: #f7f1e4; font-size: 12px; font-weight: 850; box-shadow: 0 6px 18px rgba(32,30,29,.25); }
        .bv-gmap-status[data-state="missing-key"], .bv-gmap-status[data-state="error"] { background: #c83727; }
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
