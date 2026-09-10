import { createDb, events, slugify } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { isEventPast } from "@/lib/event-filters";
import { SITE_URL } from "@/lib/site-url";

// Queries D1 for the current category list — only available inside a real
// request, so this can't be statically prerendered (same reasoning as
// apps/web/app/marketplace/page.tsx).
export const dynamic = "force-dynamic";

/**
 * llms.txt (https://llmstxt.org) — a curated, LLM-oriented overview of the
 * site's structure, not an exhaustive data dump (that's sitemap.xml). No
 * Next.js built-in convention exists for this route (unlike sitemap.ts/
 * robots.ts), so it's a plain route handler.
 */
export async function GET() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select({ category: events.category, startTime: events.startTime, endTime: events.endTime }).from(events);
  const categories = [...new Set(rows.filter((r) => !isEventPast(r)).map((r) => r.category).filter((c): c is string => Boolean(c)))].sort();

  const categoryLines = categories
    .map((c) => `- [${c}](${SITE_URL}/santa-cruz-de-la-sierra/eventos/categoria/${slugify(c)})`)
    .join("\n");

  const body = `# BoliVibes

> Local discovery app for Santa Cruz de la Sierra, Bolivia — events, venues, and a BoliPass
> membership with 2-for-1 deals at gastronomy, nightlife, and tour partners.

## Events

- [All upcoming events](${SITE_URL}/santa-cruz-de-la-sierra/eventos)
${categoryLines}

## Places

- [Venues in Santa Cruz de la Sierra](${SITE_URL}/santa-cruz-de-la-sierra/lugares)

## Notes

- Content is bilingual — every page above has an English variant at the same path under \`/en\`.
- The full, exhaustive list of individual event and venue pages is in the sitemap, not repeated
  here: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
