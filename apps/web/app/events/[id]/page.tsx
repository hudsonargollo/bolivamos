import { notFound } from "next/navigation";
import { createDb, events } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { cf } from "@/lib/cloudflare";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) notFound();

  // Parsed from the date/time parts directly, not via `new Date(iso)` +
  // toLocaleDateString: that pair renders in the server's local timezone,
  // which silently shifts a date-only ISO string (parsed as UTC midnight)
  // back a day whenever the server runs west of UTC.
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(event.startTime);
  const hasTime = Boolean(m?.[4]);
  const when = m
    ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).toLocaleDateString("es-BO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }) + (hasTime ? ` · ${m[4]}:${m[5]}` : "")
    : event.startTime;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", fontFamily: "Figtree, sans-serif" }}>
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
        <p style={{ fontWeight: 700, color: "#201e1d", margin: "0 0 16px" }}>
          {event.isFree ? "Gratis" : event.priceText}
        </p>
      )}
      {event.description && (
        <p style={{ color: "#4a4237", lineHeight: 1.6, margin: "0 0 24px" }}>{event.description}</p>
      )}
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
            Google Maps
          </a>
        )}
        <a
          href="/"
          style={{
            fontWeight: 700,
            textDecoration: "none",
            padding: "9px 18px",
            borderRadius: 999,
            background: "#c4703d",
            color: "#f7f1e4",
          }}
        >
          ← Volver
        </a>
      </div>
    </main>
  );
}
