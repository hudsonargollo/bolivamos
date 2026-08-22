import { sql, eq } from "drizzle-orm";
import { createDb, redemptions, vouchers, venues } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { getCurrentSessionRsc } from "@/lib/session-rsc";

export default async function HostAnalyticsPage() {
  const session = await getCurrentSessionRsc();
  const { env } = cf();
  const db = createDb(env.DB);

  // Redemption + unique-customer counts per voucher, scoped to this host's venues.
  const rows = await db
    .select({
      voucherTitle: vouchers.title,
      venueName: venues.name,
      totalRedemptions: sql<number>`count(${redemptions.id})`,
      uniqueCustomers: sql<number>`count(distinct ${redemptions.userId})`,
      totalSavedBob: sql<number>`coalesce(sum(${redemptions.savedAmountBob}), 0)`,
    })
    .from(redemptions)
    .innerJoin(vouchers, eq(redemptions.voucherId, vouchers.id))
    .innerJoin(venues, eq(vouchers.venueId, venues.id))
    .where(session ? eq(venues.hostId, session.userId) : undefined)
    .groupBy(vouchers.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Analytics</h1>
      <p className="text-muted-clay-gray">
        Redemptions, unique foot traffic, and estimated secondary revenue per voucher (PRD 4.4).
      </p>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-2">Voucher</th>
            <th className="p-2">Venue</th>
            <th className="p-2">Redemptions</th>
            <th className="p-2">Unique customers</th>
            <th className="p-2">Total saved (BOB)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.voucherTitle}-${row.venueName}`} className="border-t">
              <td className="p-2">{row.voucherTitle}</td>
              <td className="p-2">{row.venueName}</td>
              <td className="p-2">{row.totalRedemptions}</td>
              <td className="p-2">{row.uniqueCustomers}</td>
              <td className="p-2">{row.totalSavedBob}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
