import { notFound, permanentRedirect } from "next/navigation";
import { createDb, events, eq } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";

/**
 * Legacy UUID-keyed URL, kept as a redirect shim for any already-shared or
 * indexed links — the real page now lives at
 * /santa-cruz-de-la-sierra/eventos/[slug] (see the [locale] route tree).
 */
export default async function LegacyEventRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event || !event.slug) notFound();
  permanentRedirect(`/santa-cruz-de-la-sierra/eventos/${event.slug}`);
}
