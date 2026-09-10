import type { Metadata } from "next";
import Link from "next/link";
import { createDb, events, desc } from "@bolivibes/db";
import { slugify } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { isEventPast } from "@/lib/event-filters";
import { SITE_URL } from "@/lib/site-url";

// Calls cf() with no dynamic segment on this route — D1 access only exists
// inside a real request, so this can't be statically prerendered (same
// reasoning as apps/web/app/marketplace/page.tsx).
export const dynamic = "force-dynamic";

type Locale = "es" | "en";

const COPY = {
  es: { title: "Eventos en Santa Cruz de la Sierra", desc: "Los próximos eventos en Santa Cruz — música, vida nocturna y más.", empty: "No hay eventos próximos por ahora." },
  en: { title: "Events in Santa Cruz de la Sierra", desc: "Upcoming events in Santa Cruz — music, nightlife, and more.", empty: "No upcoming events right now." },
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
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", fontFamily: "Figtree, sans-serif" }}>
      <h1 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 34, color: "#201e1d", margin: "0 0 24px" }}>
        {t.title}
      </h1>
      {categories.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {categories.map((category) => (
            <Link
              key={category}
              href={`${base}/categoria/${slugify(category)}`}
              style={{
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(122,138,94,.14)",
                color: "#5c6e45",
              }}
            >
              {category}
            </Link>
          ))}
        </div>
      )}
      {upcoming.length === 0 && <p style={{ color: "#7a6a52" }}>{t.empty}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {upcoming
          .filter((e) => e.slug)
          .map((e) => (
            <Link
              key={e.id}
              href={`${base}/${e.slug}`}
              style={{
                display: "block",
                background: "#fbf4e6",
                borderRadius: 16,
                padding: "16px 20px",
                textDecoration: "none",
              }}
            >
              <div style={{ fontWeight: 700, color: "#201e1d" }}>{e.title}</div>
              {(e.venueName || e.district) && (
                <div style={{ color: "#7a6a52", fontSize: 14, marginTop: 4 }}>
                  {[e.venueName, e.district].filter(Boolean).join(" · ")}
                </div>
              )}
            </Link>
          ))}
      </div>
    </main>
  );
}
