import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createDb, events, eq } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import { isEventPast } from "@/lib/event-filters";
import { SITE_URL } from "@/lib/site-url";
import ConnectPanel from "./connect-panel";

type Locale = "es" | "en";

const COPY = {
  es: { free: "Gratis", back: "Volver", maps: "Google Maps" },
  en: { free: "Free", back: "Back", maps: "Google Maps" },
} as const;

// Not wrapped in React's cache() — this repo pins stable react@18.3.1, and
// cache() only ships in React's canary channel. generateMetadata and the
// page body each run their own D1 lookup; negligible cost at this scale.
async function getEvent(slug: string) {
  const { env } = cf();
  const db = createDb(env.DB);
  const [event] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return event ?? null;
}

function urlFor(locale: Locale, slug: string): string {
  const path = `/santa-cruz-de-la-sierra/eventos/${slug}`;
  return locale === "en" ? `${SITE_URL}/en${path}` : `${SITE_URL}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};

  const title = `${event.title} — BoliVamos`;
  const description =
    event.description ??
    (locale === "en"
      ? `${event.title} in Santa Cruz de la Sierra${event.venueName ? ` at ${event.venueName}` : ""}.`
      : `${event.title} en Santa Cruz de la Sierra${event.venueName ? ` en ${event.venueName}` : ""}.`);

  return {
    title,
    description,
    alternates: {
      canonical: urlFor(locale, slug),
      languages: {
        es: urlFor("es", slug),
        en: urlFor("en", slug),
        "x-default": urlFor("es", slug),
      },
    },
    openGraph: {
      title,
      description,
      url: urlFor(locale, slug),
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
    robots: isEventPast(event) ? { index: false, follow: true } : undefined,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const t = COPY[locale];
  const session = await getCurrentSessionRsc();

  // Parsed from the date/time parts directly, not via `new Date(iso)` +
  // toLocaleDateString: that pair renders in the server's local timezone,
  // which silently shifts a date-only ISO string (parsed as UTC midnight)
  // back a day whenever the server runs west of UTC.
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(event.startTime);
  const hasTime = Boolean(m?.[4]);
  const when = m
    ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).toLocaleDateString(
        locale === "en" ? "en-US" : "es-BO",
        { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" },
      ) + (hasTime ? ` · ${m[4]}:${m[5]}` : "")
    : event.startTime;

  const canonicalUrl = urlFor(locale, slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startTime,
    endDate: event.endTime ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: event.description ?? undefined,
    image: event.imageUrl ? [event.imageUrl] : undefined,
    url: canonicalUrl,
    location: {
      "@type": "Place",
      name: event.venueName ?? "Santa Cruz de la Sierra",
      address: event.district ?? undefined,
      geo: event.lat != null && event.lng != null ? { "@type": "GeoCoordinates", latitude: event.lat, longitude: event.lng } : undefined,
    },
    offers:
      event.isFree || event.priceText
        ? {
            "@type": "Offer",
            price: event.isFree ? "0" : undefined,
            priceCurrency: "BOB",
            availability: "https://schema.org/InStock",
            url: canonicalUrl,
          }
        : undefined,
  };

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", fontFamily: "Figtree, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt=""
          style={{ width: "100%", borderRadius: 16, marginBottom: 24, display: "block" }}
        />
      )}
      {event.category && (
        <div style={{ fontWeight: 700, fontSize: 13, color: "#5c6e45", marginBottom: 8 }}>{event.category}</div>
      )}
      <h1 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 34, color: "#201e1d", margin: "0 0 12px" }}>
        {event.title}
      </h1>
      <p style={{ fontWeight: 700, color: "#b0532f", margin: "0 0 4px" }}>{when}</p>
      {(event.venueName || event.district) && (
        <p style={{ color: "#7a6a52", margin: "0 0 16px" }}>
          {[event.venueName, event.district].filter(Boolean).join(" · ")}
        </p>
      )}
      {(event.priceText || event.isFree) && (
        <p style={{ fontWeight: 700, color: "#201e1d", margin: "0 0 16px" }}>{event.isFree ? t.free : event.priceText}</p>
      )}
      {event.description && (
        <p style={{ color: "#4a4237", lineHeight: 1.6, margin: "0 0 24px" }}>{event.description}</p>
      )}
      {session && <ConnectPanel eventId={event.id} isVip={session.isBoliPass} />}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {event.mapsUrl && (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener"
            style={{
              fontWeight: 700,
              textDecoration: "none",
              padding: "9px 18px",
              borderRadius: 999,
              background: "rgba(196,113,57,.14)",
              color: "#8f4225",
            }}
          >
            {t.maps}
          </a>
        )}
        <a
          href={locale === "en" ? "/en/santa-cruz-de-la-sierra/eventos" : "/santa-cruz-de-la-sierra/eventos"}
          style={{
            fontWeight: 700,
            textDecoration: "none",
            padding: "9px 18px",
            borderRadius: 999,
            background: "#c4703d",
            color: "#f7f1e4",
          }}
        >
          ← {t.back}
        </a>
      </div>
    </main>
  );
}
