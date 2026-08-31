import type { MetadataRoute } from "next";
import { createDb, events, venues } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { isEventPast } from "@/lib/event-filters";
import { SITE_URL } from "@/lib/site-url";

// Queries D1 for the URL list — only available inside a real request, so
// this can't be statically prerendered (same reasoning as
// apps/web/app/marketplace/page.tsx).
export const dynamic = "force-dynamic";

function withLocales(path: string): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}${path}` },
    { url: `${SITE_URL}/en${path}` },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { env } = cf();
  const db = createDb(env.DB);

  const [allEvents, allVenues] = await Promise.all([
    db.select().from(events),
    db.select().from(venues),
  ]);

  const upcomingEvents = allEvents.filter((e) => e.slug && !isEventPast(e));
  const slugVenues = allVenues.filter((v) => v.slug);

  return [
    { url: SITE_URL },
    ...withLocales("/santa-cruz-de-la-sierra/eventos"),
    ...withLocales("/santa-cruz-de-la-sierra/lugares"),
    ...upcomingEvents.flatMap((e) => withLocales(`/santa-cruz-de-la-sierra/eventos/${e.slug}`)),
    ...slugVenues.flatMap((v) => withLocales(`/santa-cruz-de-la-sierra/lugares/${v.slug}`)),
  ];
}
