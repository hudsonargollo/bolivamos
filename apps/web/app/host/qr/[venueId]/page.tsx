import { eq } from "drizzle-orm";
import { createDb, venues } from "@bolivamos/db";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { cf } from "@/lib/cloudflare";
import { signVenueQr } from "@/lib/qr-signing";

export default async function HostVenueQrPage({
  params,
}: {
  params: Promise<{ venueId: string }>;
}) {
  const { venueId } = await params;
  const { env } = cf();
  const db = createDb(env.DB);
  const [venue] = await db.select().from(venues).where(eq(venues.id, venueId)).limit(1);
  if (!venue) notFound();

  const sig = await signVenueQr(venue.id, venue.qrSecretHash);
  const payload = JSON.stringify({ venueId: venue.id, sig });
  const qrDataUrl = await QRCode.toDataURL(payload);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">{venue.name} — Redemption QR</h1>
      <p className="text-muted-clay-gray">
        Print this and keep it at the register. Guests scan it in-app to redeem any active BoliPass
        voucher at this venue.
      </p>
      {/* Plain <img> — data: URL, no benefit from next/image optimization here. */}
      <img src={qrDataUrl} alt={`QR code for ${venue.name}`} className="h-64 w-64 rounded-lg border" />
      <a
        href={qrDataUrl}
        download={`bolivamos-qr-${venue.id}.png`}
        className="inline-block rounded-pill bg-boli-green px-5 py-2 text-white"
      >
        Download PNG
      </a>
    </div>
  );
}
