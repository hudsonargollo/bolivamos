import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createDb, events, eq } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import { isEventPast } from "@/lib/event-filters";
import { SITE_URL } from "@/lib/site-url";
import ConnectPanel from "./connect-panel";

type Locale = "es" | "en";

const COPY = {
  es: { free: "Gratis", back: "Volver", maps: "Google Maps", about: "About", going: "Who's going" },
  en: { free: "Free", back: "Back", maps: "Google Maps", about: "About", going: "Who's going" },
} as const;

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

  const title = `${event.title} — BoliVibes`;
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

  const eventosUrl = locale === "en" ? `${SITE_URL}/en/santa-cruz-de-la-sierra/eventos` : `${SITE_URL}/santa-cruz-de-la-sierra/eventos`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BoliVibes", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: locale === "en" ? "Events" : "Eventos", item: eventosUrl },
      { "@type": "ListItem", position: 3, name: event.title, item: canonicalUrl },
    ],
  };

  return (
    <main className="bv-app-shell">
      <section className="bv-container-narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="bv-card-media bv-card" style={{ marginBottom: 24 }} />}
        <div className="bv-chip-row" style={{ marginBottom: 12 }}>
          {event.category && <span className="bv-chip">{event.category}</span>}
          {event.isVipOnly && <span className="bv-chip bv-chip-active">VIP</span>}
          {(event.priceText || event.isFree) && <span className="bv-chip">{event.isFree ? t.free : event.priceText}</span>}
        </div>
        <h1 className="bv-title">{event.title}</h1>
        <p className="bv-subtitle" style={{ marginBottom: 8, color: "var(--bv-orange)", fontWeight: 850 }}>{when}</p>
        {(event.venueName || event.district) && <p className="bv-subtitle">{[event.venueName, event.district].filter(Boolean).join(" · ")}</p>}
        {event.description && (
          <section className="bv-card bv-card-pad" style={{ marginBottom: 16 }}>
            <p className="bv-section-kicker">{t.about}</p>
            <p style={{ color: "var(--bv-sub)", fontWeight: 600, lineHeight: 1.6, margin: 0 }}>{event.description}</p>
          </section>
        )}
        {session && <ConnectPanel eventId={event.id} isVip={session.isBoliPass} />}
        <div className="bv-chip-row">
          {event.mapsUrl && (
            <a href={event.mapsUrl} target="_blank" rel="noopener" className="bv-soft">
              {t.maps}
            </a>
          )}
          <a href={locale === "en" ? "/en/santa-cruz-de-la-sierra/eventos" : "/santa-cruz-de-la-sierra/eventos"} className="bv-btn">
            ← {t.back}
          </a>
        </div>
      </section>
    </main>
  );
}
