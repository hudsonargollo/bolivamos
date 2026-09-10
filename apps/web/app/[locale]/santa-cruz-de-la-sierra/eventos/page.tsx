import type { Metadata } from "next";
import Link from "next/link";
import { createDb, events, desc } from "@bolivibes/db";
import { slugify } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { isEventPast } from "@/lib/event-filters";
import { SITE_URL } from "@/lib/site-url";

// Calls cf() with no dynamic segment on this route — D1 access only exists
// inside a real request, so this can't be statically prerendered.
export const dynamic = "force-dynamic";

type Locale = "es" | "en";

const COPY = {
  es: { title: "Eventos en Santa Cruz de la Sierra", desc: "Los próximos eventos en Santa Cruz — música, vida nocturna y más.", empty: "No hay eventos próximos por ahora.", kicker: "Tonight feed", helper: "Slide through categories · tap any event for details" },
  en: { title: "Events in Santa Cruz de la Sierra", desc: "Upcoming events in Santa Cruz — music, nightlife, and more.", empty: "No upcoming events right now.", kicker: "Tonight feed", helper: "Slide through categories · tap any event for details" },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = COPY[locale];
  const path = locale === "en" ? "/en/santa-cruz-de-la-sierra/eventos" : "/santa-cruz-de-la-sierra/eventos";
  return {
    title: `${t.title} — BoliVibes`,
    description: t.desc,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        es: `${SITE_URL}/santa-cruz-de-la-sierra/eventos`,
        en: `${SITE_URL}/en/santa-cruz-de-la-sierra/eventos`,
        "x-default": `${SITE_URL}/santa-cruz-de-la-sierra/eventos`,
      },
    },
  };
}

export default async function EventsIndexPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = COPY[locale];

  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(events).orderBy(desc(events.featured), events.startTime);
  const upcoming = rows.filter((e) => !isEventPast(e));

  const base = locale === "en" ? "/en/santa-cruz-de-la-sierra/eventos" : "/santa-cruz-de-la-sierra/eventos";
  const categories = [...new Set(upcoming.map((e) => e.category).filter((c): c is string => Boolean(c)))].sort();

  return (
    <main className="bv-app-shell">
      <section className="bv-container-narrow">
        <p className="bv-section-kicker">{t.kicker}</p>
        <h1 className="bv-title">{t.title}</h1>
        <p className="bv-subtitle">{t.helper}</p>
        {categories.length > 0 && (
          <div className="bv-chip-row" style={{ marginBottom: 28 }}>
            {categories.map((category) => (
              <Link key={category} href={`${base}/categoria/${slugify(category)}`} className="bv-chip">
                {category}
              </Link>
            ))}
          </div>
        )}
        {upcoming.length === 0 && <p className="bv-subtitle">{t.empty}</p>}
        <div className="bv-stack">
          {upcoming
            .filter((e) => e.slug)
            .map((e) => (
              <Link key={e.id} href={`${base}/${e.slug}`} className="bv-card bv-card-pad">
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  {e.category && <span className="bv-chip">{e.category}</span>}
                  {e.featured && <span className="bv-chip bv-chip-active">Featured</span>}
                </div>
                <div className="bv-card-title">{e.title}</div>
                {(e.venueName || e.district) && <div className="bv-card-meta">{[e.venueName, e.district].filter(Boolean).join(" · ")}</div>}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
