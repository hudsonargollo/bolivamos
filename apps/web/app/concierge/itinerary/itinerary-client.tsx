"use client";

import { useState } from "react";
import type { Category, ItineraryResponse } from "@bolivibes/api-schema";

const CATEGORY_LABELS: Record<Category, string> = {
  music: "Music",
  nightlife: "Nightlife / Clubs",
  gastronomy: "Gastronomy",
  historical: "Historical / Traditional",
  cultural: "Cultural",
};

export default function ItineraryClient() {
  const [selected, setSelected] = useState<Category[]>([]);
  const [days, setDays] = useState(1);
  const [result, setResult] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(category: Category) {
    setSelected((prev) => (prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]));
  }

  async function generate() {
    if (selected.length === 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ days, categories: selected }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not generate itinerary.");
      }

      setResult((await res.json()) as ItineraryResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate itinerary.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bv-stack">
      <div className="bv-card bv-card-pad">
        <p className="bv-section-kicker">Plan my trip</p>
        <h1 className="bv-title-sm" style={{ marginBottom: 8 }}>Build a Santa Cruz itinerary</h1>
        <p className="bv-card-meta" style={{ marginBottom: 18 }}>
          Same BoliPass itinerary flow as the mobile app: choose interests, pick trip length, and let BolivIA create a plan.
        </p>

        <p className="bv-card-title" style={{ marginBottom: 10 }}>Interests</p>
        <div className="bv-chip-row" style={{ marginBottom: 18 }}>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => {
            const active = selected.includes(category);
            return (
              <button key={category} type="button" className={`bv-chip ${active ? "bv-chip-active" : ""}`} onClick={() => toggle(category)}>
                {CATEGORY_LABELS[category]}
              </button>
            );
          })}
        </div>

        <p className="bv-card-title" style={{ marginBottom: 10 }}>Days</p>
        <div className="bv-chip-row" style={{ marginBottom: 18 }}>
          {[1, 2, 3].map((day) => (
            <button key={day} type="button" className={`bv-chip ${days === day ? "bv-chip-active" : ""}`} onClick={() => setDays(day)}>
              {day}
            </button>
          ))}
        </div>

        {error && <p className="bv-error" role="alert">{error}</p>}
        <button className="bv-btn" type="button" onClick={generate} disabled={loading || selected.length === 0} style={{ width: "100%" }}>
          {loading ? "Generating…" : "Generate itinerary"}
        </button>
      </div>

      {result?.days.map((day) => (
        <section key={day.label} className="bv-stack" aria-label={day.label}>
          <h2 className="bv-title-sm" style={{ fontSize: 22, marginBottom: 0 }}>{day.label}</h2>
          {day.stops.map((stop, index) => (
            <article key={`${day.label}-${index}`} className="bv-card bv-card-pad">
              <p className="bv-section-kicker" style={{ marginBottom: 6 }}>{stop.time}</p>
              <h3 className="bv-card-title" style={{ margin: 0 }}>{stop.title}</h3>
              <p className="bv-card-meta" style={{ marginBottom: 0 }}>{stop.description}</p>
              {stop.hasBoliPassOffer && <p className="bv-error" style={{ marginBottom: 0 }}>BoliPass offer here</p>}
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
