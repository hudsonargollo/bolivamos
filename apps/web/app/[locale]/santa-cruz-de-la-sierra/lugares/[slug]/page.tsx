import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createDb, venues, events, eq } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { isEventPast } from "@/lib/event-filters";
import { SITE_URL } from "@/lib/site-url";

type Locale = "es" | "en";

const CATEGORY_LABEL: Record<string, { es: string; en: string }> = {
  music: { es: "Música", en: "Music" },
  nightlife: { es: "Vida nocturna", en: "Nightlife" },
  gastronomy: { es: "Gastronomía", en: "Gastronomy" },
  historical: { es: "Histórico", en: "Historical" },
  cultural: { es: "Cultural", en: "Cultural" },
};

const COPY = {
  es: { maps: "Google Maps", back: "Volver", upcoming: "Próximos eventos", noEvents: "Sin eventos próximos por ahora." },
  en: { maps: "Google Maps", back: "Back", upcoming: "Upcoming events", noEvents: "No upcoming events right now." },
} as const;

// Not wrapped in React's cache() — this repo pins stable react@18.3.1, and
// cache() only ships in React's canary channel. generateMetadata and the
// page body each run their own D1 lookup; negligible cost at this scale.
async function getVenue(slug: string) {
  const { env } = cf();
  const db = createDb(env.DB);
  const [venue] = await db.select().from(venues).where(eq(venues.slug, slug)).limit(1);
  return venue ?? null;
}

function urlFor(locale: Locale, slug: string): string {
  const path = `/santa-cruz-de-la-sierra/lugares/${slug}`;
  return locale === "en" ? `${SITE_URL}/en${path}` : `${SITE_URL}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return {};

  const categoryLabel = CATEGORY_LABEL[venue.category]?.[locale] ?? venue.category;
  const title = `${venue.name} — BoliVamos`;
  const description =
    locale === "en"
      ? `${venue.name} — ${categoryLabel} in Santa Cruz de la Sierra${venue.address ? `, ${venue.address}` : ""}.`
      : `${venue.name} — ${categoryLabel} en Santa Cruz de la Sierra${venue.address ? `, ${venue.address}` : ""}.`;

  return {
    title,
    description,
    alternates: {
      canonical: urlFor(locale, slug),
      languages: { es: urlFor("es", slug), en: urlFor("en", slug), "x-default": urlFor("es", slug) },
    },
    openGraph: { title, description, url: urlFor(locale, slug) },
    twitter: { card: "summary", title, description },
  };
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();

  const t = COPY[locale];
  const categoryLabel = CATEGORY_LABEL[venue.category]?.[locale] ?? venue.category;

  const { env } = cf();
  const db = createDb(env.DB);
  const venueEvents = (await db.select().from(events).where(eq(events.venueId, venue.id)))
    .filter((e) => !isEventPast(e) && e.slug)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const eventosBase = locale === "en" ? "/en/santa-cruz-de-la-sierra/eventos" : "/santa-cruz-de-la-sierra/eventos";
  const lugaresBase = locale === "en" ? "/en/santa-cruz-de-la-sierra/lugares" : "/santa-cruz-de-la-sierra/lugares";

  const mapsUrl = venue.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}`)}`
    : venue.latitude != null && venue.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
      : null;

  const canonicalUrl = urlFor(locale, slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: venue.name,
    url: canonicalUrl,
    address: venue.address ?? undefined,
    geo:
      venue.latitude != null && venue.longitude != null
        ? { "@type": "GeoCoordinates", latitude: venue.latitude, longitude: venue.longitude }
        : undefined,
  };

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", fontFamily: "Figtree, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ fontWeight: 700, fontSize: 13, color: "#5c6e45", marginBottom: 8 }}>{categoryLabel}</div>
      <h1 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 34, color: "#201e1d", margin: "0 0 12px" }}>
        {venue.name}
      </h1>
      {venue.address && <p style={{ color: "#7a6a52", margin: "0 0 24px" }}>{venue.address}</p>}

      {venueEvents.length > 0 && (
        <>
          <h2 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 20, color: "#201e1d", margin: "0 0 12px" }}>
            {t.upcoming}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {venueEvents.map((e) => (
              <Link
                key={e.id}
                href={`${eventosBase}/${e.slug}`}
                style={{ display: "block", background: "#fbf4e6", borderRadius: 12, padding: "12px 16px", textDecoration: "none", color: "#201e1d", fontWeight: 700 }}
              >
                {e.title}
              </Link>
            ))}
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener"
            style={{ fontWeight: 700, textDecoration: "none", padding: "9px 18px", borderRadius: 999, background: "rgba(196,113,57,.14)", color: "#8f4225" }}
          >
            {t.maps}
          </a>
        )}
        <Link
          href={lugaresBase}
          style={{ fontWeight: 700, textDecoration: "none", padding: "9px 18px", borderRadius: 999, background: "#c4703d", color: "#f7f1e4" }}
        >
          ← {t.back}
        </Link>
      </div>
    </main>
  );
}
