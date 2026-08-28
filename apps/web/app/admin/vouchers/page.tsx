import { createDb, venues, vouchers } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { setVoucherActive } from "../actions/vouchers";

export default async function AdminVouchersPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const [rows, allVenues] = await Promise.all([db.select().from(vouchers), db.select().from(venues)]);
  const venueNameById = new Map(allVenues.map((v) => [v.id, v.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase">Vouchers</h1>
        <a href="/admin/vouchers/new" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          New voucher
        </a>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-bg-off-white">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Venue</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((voucher) => (
              <tr key={voucher.id} className="border-b last:border-0">
                <td className="p-3">{voucher.title}</td>
                <td className="p-3">{voucher.venueId ? venueNameById.get(voucher.venueId) ?? voucher.venueId : "—"}</td>
                <td className="p-3">{voucher.discountType}</td>
                <td className="p-3">
                  <form action={setVoucherActive} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={voucher.id} />
                    <input type="hidden" name="isActive" value={(!voucher.isActive).toString()} />
                    <span className={voucher.isActive ? "text-boli-green" : "text-boli-red"}>
                      {voucher.isActive ? "Active" : "Inactive"}
                    </span>
                    <button type="submit" className="rounded-pill border px-3 py-1 text-xs">
                      {voucher.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <a href={`/admin/vouchers/${voucher.id}`} className="text-boli-green underline">
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
