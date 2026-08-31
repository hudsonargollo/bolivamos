import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createDb, events, eq } from "@bolivamos/db";
import { slugify } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { isEventPast } from "@/lib/event-filters";
import { SITE_URL } from "@/lib/site-url";

type Locale = "es" | "en";

const COPY = {
  es: { empty: "No hay eventos próximos en esta categoría." },
  en: { empty: "No upcoming events in this category." },
} as const;

/**
 * events.category is freeform text, not an enum (see packages/db/src/schema.ts)
 * — there's no stored slug column for it. With only 9 distinct real values in
 * production, matching the requested slug against the live distinct values
 * (slugified on the fly) is simpler and cheaper than adding a column/table
 * for a small, stable set.
 */
async function findCategory(categorySlug: string): Promise<string | null> {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select({ category: events.category }).from(events);
  const distinct = new Set(rows.map((r) => r.category).filter((c): c is string => Boolean(c)));
  for (const category of distinct) {
    if (slugify(category) === categorySlug) return category;
  }
  return null;
}

function urlFor(locale: Locale, categorySlug: string): string {
  const path = `/santa-cruz-de-la-sierra/eventos/categoria/${categorySlug}`;
  return locale === "en" ? `${SITE_URL}/en${path}` : `${SITE_URL}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; category: string }>;
}): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const category = await findCategory(categorySlug);
  if (!category) return {};

  const title =
    locale === "en" ? `${category} events in Santa Cruz — BoliVamos` : `Eventos de ${category} en Santa Cruz — BoliVamos`;
  const description =
    locale === "en"
      ? `Upcoming ${category} events in Santa Cruz de la Sierra.`
      : `Próximos eventos de ${category} en Santa Cruz de la Sierra.`;

  return {
    title,
    description,
    alternates: {
      canonical: urlFor(locale, categorySlug),
      languages: { es: urlFor("es", categorySlug), en: urlFor("en", categorySlug), "x-default": urlFor("es", categorySlug) },
    },
  };
}

export default async function CategoryHubPage({
  params,
}: {
  params: Promise<{ locale: Locale; category: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  const category = await findCategory(categorySlug);
  if (!category) notFound();

  const t = COPY[locale];
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(events).where(eq(events.category, category));
  const upcoming = rows.filter((e) => !isEventPast(e) && e.slug).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const eventosBase = locale === "en" ? "/en/santa-cruz-de-la-sierra/eventos" : "/santa-cruz-de-la-sierra/eventos";

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", fontFamily: "Figtree, sans-serif" }}>
      <h1 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 34, color: "#201e1d", margin: "0 0 24px" }}>
        {category}
      </h1>
      {upcoming.length === 0 && <p style={{ color: "#7a6a52" }}>{t.empty}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {upcoming.map((e) => (
          <Link
            key={e.id}
            href={`${eventosBase}/${e.slug}`}
            style={{ display: "block", background: "#fbf4e6", borderRadius: 16, padding: "16px 20px", textDecoration: "none" }}
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
