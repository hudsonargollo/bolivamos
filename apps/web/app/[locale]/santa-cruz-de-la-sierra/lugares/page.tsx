import type { Metadata } from "next";
import Link from "next/link";
import { createDb, venues, desc } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { SITE_URL } from "@/lib/site-url";

// Calls cf() with no dynamic segment — D1 access only exists inside a real
// request (same reasoning as apps/web/app/marketplace/page.tsx).
export const dynamic = "force-dynamic";

type Locale = "es" | "en";

const CATEGORY_LABEL: Record<string, { es: string; en: string }> = {
  music: { es: "Música", en: "Music" },
  nightlife: { es: "Vida nocturna", en: "Nightlife" },
  gastronomy: { es: "Gastronomía", en: "Gastronomy" },
  historical: { es: "Histórico", en: "Historical" },
  cultural: { es: "Cultural", en: "Cultural" },
};

const COPY = {
  es: { title: "Lugares en Santa Cruz de la Sierra", desc: "Bares, restaurantes y lugares para salir en Santa Cruz." },
  en: { title: "Places in Santa Cruz de la Sierra", desc: "Bars, restaurants, and places to go out in Santa Cruz." },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = COPY[locale];
  const path = locale === "en" ? "/en/santa-cruz-de-la-sierra/lugares" : "/santa-cruz-de-la-sierra/lugares";
  return {
    title: `${t.title} — BoliVibes`,
    description: t.desc,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        es: `${SITE_URL}/santa-cruz-de-la-sierra/lugares`,
        en: `${SITE_URL}/en/santa-cruz-de-la-sierra/lugares`,
        "x-default": `${SITE_URL}/santa-cruz-de-la-sierra/lugares`,
      },
    },
  };
}

export default async function VenuesIndexPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = COPY[locale];

  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(venues).orderBy(desc(venues.featured), venues.name);

  const base = locale === "en" ? "/en/santa-cruz-de-la-sierra/lugares" : "/santa-cruz-de-la-sierra/lugares";

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", fontFamily: "Figtree, sans-serif" }}>
      <h1 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 34, color: "#201e1d", margin: "0 0 24px" }}>
        {t.title}
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows
          .filter((v) => v.slug)
          .map((v) => (
            <Link
              key={v.id}
              href={`${base}/${v.slug}`}
              style={{ display: "block", background: "#fbf4e6", borderRadius: 16, padding: "16px 20px", textDecoration: "none" }}
            >
              <div style={{ fontWeight: 700, color: "#201e1d" }}>{v.name}</div>
              <div style={{ color: "#7a6a52", fontSize: 14, marginTop: 4 }}>
                {CATEGORY_LABEL[v.category]?.[locale] ?? v.category}
              </div>
            </Link>
          ))}
      </div>
    </main>
  );
}
