import Link from "next/link";
import { createDb, events, venues, desc } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { isEventPast } from "@/lib/event-filters";
import { SITE_URL } from "@/lib/site-url";
import HomeScene from "./home-scene";

// D1 access only exists inside a real request (same reasoning as
// apps/web/app/marketplace/page.tsx) — this page can't be statically
// prerendered once it queries the DB for the section below.
export const dynamic = "force-dynamic";

/**
 * HomeScene is a client-rendered 3D hero. The sections below now use the same
 * BoliVibes app UI vocabulary as mobile: clay cards, chips, pressed buttons,
 * compact metadata joined with middots, and warm paper surfaces.
 */
export default async function HomePage() {
  const { env } = cf();
  const db = createDb(env.DB);

  const [allEvents, allVenues] = await Promise.all([
    db.select().from(events).orderBy(desc(events.featured), events.startTime).limit(60),
    db.select().from(venues).orderBy(desc(venues.featured), venues.name).limit(40),
  ]);

  const upcomingEvents = allEvents.filter((e) => e.slug && !isEventPast(e)).slice(0, 12);
  const listedVenues = allVenues.filter((v) => v.slug).slice(0, 8);

  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Organization", name: "BoliVibes", url: SITE_URL, logo: `${SITE_URL}/favicon-512.png` },
    { "@context": "https://schema.org", "@type": "WebSite", name: "BoliVibes", url: SITE_URL },
  ];

  return (
    <main className="bv-app-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeScene />
      <section className="bv-container">
        {upcomingEvents.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <p className="bv-section-kicker">Tonight feed</p>
            <h2 className="bv-title-sm">Próximos eventos en Santa Cruz</h2>
            <p className="bv-subtitle">The same card language as the app — scan the time, venue and vibe, then tap into the night.</p>
            <div className="bv-grid" style={{ marginBottom: 22 }}>
              {upcomingEvents.map((e) => (
                <Link key={e.id} href={`/santa-cruz-de-la-sierra/eventos/${e.slug}`} className="bv-card bv-card-pad">
                  <div className="bv-chip" style={{ marginBottom: 10 }}>
                    {e.category ?? "Event"}
                  </div>
                  <div className="bv-card-title">{e.title}</div>
                  {(e.venueName || e.district) && <div className="bv-card-meta">{[e.venueName, e.district].filter(Boolean).join(" · ")}</div>}
                </Link>
              ))}
            </div>
            <Link href="/santa-cruz-de-la-sierra/eventos" className="bv-btn">
              Ver todos los eventos →
            </Link>
          </div>
        )}

        {listedVenues.length > 0 && (
          <div>
            <p className="bv-section-kicker">Places to know</p>
            <h2 className="bv-title-sm">Lugares en Santa Cruz</h2>
            <div className="bv-grid" style={{ marginBottom: 22 }}>
              {listedVenues.map((v) => (
                <Link key={v.id} href={`/santa-cruz-de-la-sierra/lugares/${v.slug}`} className="bv-card bv-card-pad">
                  <div className="bv-card-title">{v.name}</div>
                  <div className="bv-card-meta">{v.category}</div>
                </Link>
              ))}
            </div>
            <Link href="/santa-cruz-de-la-sierra/lugares" className="bv-btn bv-btn-sage">
              Ver todos los lugares →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
