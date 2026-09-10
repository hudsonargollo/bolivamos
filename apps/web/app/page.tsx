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
 * HomeScene (above) is a client-rendered blob — scene.js/page-ui.js fetch
 * event/venue data and inject it into the page after load, so crawlers that
 * don't execute JS see an empty shell. This section is a genuine, visible,
 * server-rendered summary with real links to the slugged event/venue pages
 * — not hidden/cloaked content, just placed after the 3D hero in normal
 * document flow so it doesn't compete with or risk the existing experience.
 */
export default async function HomePage() {
  const { env } = cf();
  const db = createDb(env.DB);

  // Bounded pool, not the whole table — only the first 12 events / 8 venues
  // ever render below, but "past events" gets filtered out in JS after the
  // query, so the pool needs headroom above that display count. A
  // Lighthouse audit flagged this page's server-response-time; fetching the
  // entire (unbounded, growing) table on every request was a real
  // contributor and had no display-side reason to be unbounded.
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
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeScene />
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px 80px", fontFamily: "Figtree, sans-serif" }}>
        {upcomingEvents.length > 0 && (
          <>
            <h2 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 26, color: "#201e1d", margin: "0 0 16px" }}>
              Próximos eventos en Santa Cruz
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 40 }}>
              {upcomingEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/santa-cruz-de-la-sierra/eventos/${e.slug}`}
                  style={{ display: "block", background: "#fbf4e6", borderRadius: 14, padding: "14px 16px", textDecoration: "none" }}
                >
                  <div style={{ fontWeight: 700, color: "#201e1d", fontSize: 14 }}>{e.title}</div>
                  {(e.venueName || e.district) && (
                    <div style={{ color: "#7a6a52", fontSize: 12, marginTop: 4 }}>
                      {[e.venueName, e.district].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            <Link href="/santa-cruz-de-la-sierra/eventos" style={{ fontWeight: 700, color: "#8f4225", textDecoration: "none" }}>
              Ver todos los eventos →
            </Link>
          </>
        )}

        {listedVenues.length > 0 && (
          <>
            <h2 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 26, color: "#201e1d", margin: "40px 0 16px" }}>
              Lugares en Santa Cruz
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
              {listedVenues.map((v) => (
                <Link
                  key={v.id}
                  href={`/santa-cruz-de-la-sierra/lugares/${v.slug}`}
                  style={{ display: "block", background: "#fbf4e6", borderRadius: 14, padding: "14px 16px", textDecoration: "none" }}
                >
                  <div style={{ fontWeight: 700, color: "#201e1d", fontSize: 14 }}>{v.name}</div>
                  <div style={{ color: "#7a6a52", fontSize: 12, marginTop: 4 }}>{v.category}</div>
                </Link>
              ))}
            </div>
            <Link href="/santa-cruz-de-la-sierra/lugares" style={{ fontWeight: 700, color: "#8f4225", textDecoration: "none" }}>
              Ver todos los lugares →
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
