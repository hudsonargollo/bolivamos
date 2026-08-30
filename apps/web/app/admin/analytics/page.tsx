import { eq } from "@bolivamos/db";
import {
  createDb,
  users,
  redemptions,
  vouchers,
  venues,
  orders,
  conciergeConversations,
  conciergeMessages,
  connectRequests,
  userReports,
  pushCampaigns,
  appSettings,
} from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { setBolipassPrice } from "../actions/settings";
import { BOLIPASS_PRICE_KEY } from "../actions/settings-constants";
import { groupByMonth } from "./group-by-month";

function MonthTable({ title, rows, valueLabel }: { title: string; rows: { month: string; count: number; total: number }[]; valueLabel?: string }) {
  return (
    <div className="a-card">
      <p style={{ fontWeight: 700, margin: "0 0 10px" }}>{title}</p>
      {rows.length === 0 ? (
        <p className="a-muted" style={{ margin: 0 }}>
          No data yet.
        </p>
      ) : (
        <table className="a-table" style={{ fontSize: 13 }}>
          <thead>
            <tr>
              <th>Month</th>
              <th>Count</th>
              {valueLabel && <th>{valueLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {rows
              .slice()
              .reverse()
              .map((r) => (
                <tr key={r.month}>
                  <td>{r.month}</td>
                  <td>{r.count}</td>
                  {valueLabel && <td>{r.total.toFixed(2)}</td>}
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="a-card">
      <p className="a-stat-label">{label}</p>
      <p className="a-stat-num">{value}</p>
      {hint && <p className="a-muted a-hint">{hint}</p>}
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const { env } = cf();
  const db = createDb(env.DB);

  const [
    allUsers,
    allRedemptions,
    allVouchers,
    allVenues,
    allOrders,
    allConversations,
    allMessages,
    allConnectRequests,
    allReports,
    allCampaigns,
    priceSetting,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(redemptions),
    db.select().from(vouchers),
    db.select().from(venues),
    db.select().from(orders),
    db.select().from(conciergeConversations),
    db.select().from(conciergeMessages),
    db.select().from(connectRequests),
    db.select().from(userReports),
    db.select().from(pushCampaigns),
    db.select().from(appSettings).where(eq(appSettings.key, BOLIPASS_PRICE_KEY)).limit(1),
  ]);

  // User metrics
  const signupsByMonth = groupByMonth(allUsers, (u) => u.createdAt);
  const roleBreakdown = {
    visitor: allUsers.filter((u) => u.role === "visitor").length,
    host: allUsers.filter((u) => u.role === "host").length,
    admin: allUsers.filter((u) => u.role === "admin").length,
  };
  const vipUsers = allUsers.filter((u) => u.isBolipassActive);
  const vipConversion = allUsers.length > 0 ? (vipUsers.length / allUsers.length) * 100 : 0;

  // Churn — lapsed passes (expired, not renewed) vs currently active
  const now = new Date().toISOString();
  const lapsedUsers = allUsers.filter((u) => u.bolipassExpiresAt && u.bolipassExpiresAt < now && !u.isBolipassActive);
  const churnBase = lapsedUsers.length + vipUsers.length;
  const churnRate = churnBase > 0 ? (lapsedUsers.length / churnBase) * 100 : 0;

  // Revenue projection — no real BoliPass billing data exists yet, so this
  // is active-subscriber-count × admin-entered price, clearly labeled below.
  const bolipassPriceBob = Number(priceSetting[0]?.value ?? 0);
  const projectedMrrBob = vipUsers.length * (bolipassPriceBob / 3);
  const projectedArrBob = projectedMrrBob * 12;

  // Interaction: redemptions
  const redemptionsByMonth = groupByMonth(allRedemptions, (r) => r.redeemedAt, (r) => r.savedAmountBob ?? 0);
  const totalSavedBob = allRedemptions.reduce((sum, r) => sum + (r.savedAmountBob ?? 0), 0);
  const venueById = new Map(allVenues.map((v) => [v.id, v]));
  const voucherById = new Map(allVouchers.map((v) => [v.id, v]));
  const redemptionsByVenue = new Map<string, number>();
  for (const r of allRedemptions) {
    const venueId = r.voucherId ? voucherById.get(r.voucherId)?.venueId : null;
    if (!venueId) continue;
    redemptionsByVenue.set(venueId, (redemptionsByVenue.get(venueId) ?? 0) + 1);
  }
  const topVenues = Array.from(redemptionsByVenue.entries())
    .map(([venueId, count]) => ({ name: venueById.get(venueId)?.name ?? venueId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Marketplace revenue
  const paidOrders = allOrders.filter((o) => o.status === "paid");
  const revenueByMonth = groupByMonth(paidOrders, (o) => o.createdAt, (o) => o.totalPriceBob);
  const totalMarketplaceRevenue = paidOrders.reduce((sum, o) => sum + o.totalPriceBob, 0);

  return (
    <div>
      <h1 className="a-h1">Analytics</h1>

      <h2 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 18, margin: "0 0 12px" }}>User metrics</h2>
      <div className="a-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Total users" value={String(allUsers.length)} hint={`${roleBreakdown.host} hosts, ${roleBreakdown.admin} admin`} />
        <StatCard label="VIP (BoliPass) active" value={String(vipUsers.length)} hint={`${vipConversion.toFixed(1)}% of all users`} />
        <StatCard
          label="Lapsed passes (churn proxy)"
          value={String(lapsedUsers.length)}
          hint={`${churnRate.toFixed(1)}% of ever-active VIPs haven't renewed`}
        />
      </div>
      <MonthTable title="Signups per month" rows={signupsByMonth} />

      <h2 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 18, margin: "28px 0 12px" }}>
        Revenue &amp; projections
      </h2>
      <p className="a-muted" style={{ marginTop: -6, marginBottom: 16 }}>
        BoliPass has no real recorded price yet — activation just flips a flag, no payment integration. MRR/ARR
        below are a <strong>projection</strong>: active VIP count × the price you set here, not real billing data.
      </p>
      <form action={setBolipassPrice} className="a-card" style={{ display: "flex", gap: 10, alignItems: "flex-end", maxWidth: 360, marginBottom: 16 }}>
        <div className="a-field" style={{ flex: 1 }}>
          <label htmlFor="priceBob">BoliPass price (BOB, per 3 months)</label>
          <input id="priceBob" name="priceBob" type="number" step="0.01" defaultValue={priceSetting[0]?.value ?? ""} className="a-input" />
        </div>
        <button type="submit" className="clay-btn clay-btn-sm">
          Save
        </button>
      </form>
      <div className="a-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Projected MRR (BOB)" value={projectedMrrBob.toFixed(2)} hint="Estimate, not billed revenue" />
        <StatCard label="Projected ARR (BOB)" value={projectedArrBob.toFixed(2)} hint="Estimate, not billed revenue" />
        <StatCard label="Marketplace revenue (BOB)" value={totalMarketplaceRevenue.toFixed(2)} hint="Real — paid orders only" />
      </div>
      <MonthTable title="Marketplace revenue per month (BOB)" rows={revenueByMonth} valueLabel="BOB" />

      <h2 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 18, margin: "28px 0 12px" }}>
        Interaction reports
      </h2>
      <div className="a-grid" style={{ marginBottom: 16 }}>
        <StatCard label="Total redemptions" value={String(allRedemptions.length)} hint={`${totalSavedBob.toFixed(2)} BOB saved`} />
        <StatCard label="Concierge conversations" value={String(allConversations.length)} hint={`${allMessages.length} messages`} />
        <StatCard
          label="Connect requests"
          value={String(allConnectRequests.length)}
          hint={`${allConnectRequests.filter((r) => r.status === "accepted").length} accepted`}
        />
        <StatCard label="Reports filed" value={String(allReports.length)} hint={`${allReports.filter((r) => r.status === "open").length} open`} />
        <StatCard
          label="Push campaigns sent"
          value={String(allCampaigns.filter((c) => c.sentAt).length)}
          hint={`${allCampaigns.reduce((sum, c) => sum + (c.recipientCount ?? 0), 0)} total reach`}
        />
      </div>
      <div className="a-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <MonthTable title="Redemptions per month" rows={redemptionsByMonth} valueLabel="BOB saved" />
        <div className="a-card">
          <p style={{ fontWeight: 700, margin: "0 0 10px" }}>Top venues by redemptions</p>
          {topVenues.length === 0 ? (
            <p className="a-muted" style={{ margin: 0 }}>
              No redemptions yet.
            </p>
          ) : (
            <table className="a-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Redemptions</th>
                </tr>
              </thead>
              <tbody>
                {topVenues.map((v) => (
                  <tr key={v.name}>
                    <td>{v.name}</td>
                    <td>{v.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
