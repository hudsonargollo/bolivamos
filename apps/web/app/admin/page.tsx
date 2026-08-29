import { createDb, users, venues, events, vouchers, places, userReports } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { cf } from "@/lib/cloudflare";

async function getStats() {
  const { env } = cf();
  const db = createDb(env.DB);

  const [allUsers, allVenues, allEvents, allVouchers, allPlaces, openReports] = await Promise.all([
    db.select().from(users),
    db.select().from(venues),
    db.select().from(events),
    db.select().from(vouchers),
    db.select().from(places),
    db.select().from(userReports).where(eq(userReports.status, "open")),
  ]);

  return {
    totalUsers: allUsers.length,
    vipUsers: allUsers.filter((u) => u.isBolipassActive).length,
    hosts: allUsers.filter((u) => u.role === "host").length,
    totalVenues: allVenues.length,
    premiumVenues: allVenues.filter((v) => v.tier === "premium").length,
    totalEvents: allEvents.length,
    vipOnlyEvents: allEvents.filter((e) => e.isVipOnly).length,
    activeVouchers: allVouchers.filter((v) => v.isActive).length,
    unverifiedPlaces: allPlaces.filter((p) => !p.verified).length,
    openReports: openReports.length,
  };
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="a-card">
      <p className="a-stat-label">{label}</p>
      <p className="a-stat-num">{value}</p>
      {hint && <p className="a-muted a-hint">{hint}</p>}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="a-h1">Overview</h1>
      <div className="a-grid">
        <StatCard label="Users" value={stats.totalUsers} hint={`${stats.hosts} hosts`} />
        <StatCard label="VIP (BoliPass)" value={stats.vipUsers} />
        <StatCard label="Venues" value={stats.totalVenues} hint={`${stats.premiumVenues} premium`} />
        <StatCard label="Events" value={stats.totalEvents} hint={`${stats.vipOnlyEvents} VIP-only`} />
        <StatCard label="Active vouchers" value={stats.activeVouchers} />
        <StatCard
          label="Places pending review"
          value={stats.unverifiedPlaces}
          hint={stats.unverifiedPlaces > 0 ? "Needs verification before the map shows them" : undefined}
        />
        <StatCard
          label="Open reports"
          value={stats.openReports}
          hint={stats.openReports > 0 ? "VIP Connect moderation queue" : undefined}
        />
      </div>
      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {stats.unverifiedPlaces > 0 && (
          <a href="/admin/places" className="clay-btn clay-sage" style={{ display: "inline-flex" }}>
            Review {stats.unverifiedPlaces} unverified place{stats.unverifiedPlaces === 1 ? "" : "s"}
          </a>
        )}
        {stats.openReports > 0 && (
          <a href="/admin/moderation" className="clay-btn clay-danger" style={{ display: "inline-flex" }}>
            Review {stats.openReports} open report{stats.openReports === 1 ? "" : "s"}
          </a>
        )}
      </div>
    </div>
  );
}
