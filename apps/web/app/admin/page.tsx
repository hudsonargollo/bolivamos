import { createDb, users, venues, events, vouchers, places } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";

async function getStats() {
  const { env } = cf();
  const db = createDb(env.DB);

  const [allUsers, allVenues, allEvents, allVouchers, allPlaces] = await Promise.all([
    db.select().from(users),
    db.select().from(venues),
    db.select().from(events),
    db.select().from(vouchers),
    db.select().from(places),
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
  };
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <p className="text-sm text-muted-clay-gray">{label}</p>
      <p className="font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-clay-gray">{hint}</p>}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl uppercase">Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
      </div>
      {stats.unverifiedPlaces > 0 && (
        <a href="/admin/places" className="inline-block rounded-pill bg-boli-orange px-5 py-2 text-white">
          Review {stats.unverifiedPlaces} unverified place{stats.unverifiedPlaces === 1 ? "" : "s"}
        </a>
      )}
    </div>
  );
}
