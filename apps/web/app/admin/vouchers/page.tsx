import { createDb, venues, vouchers } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { setVoucherActive } from "../actions/vouchers";

export default async function AdminVouchersPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const [rows, allVenues] = await Promise.all([db.select().from(vouchers), db.select().from(venues)]);
  const venueNameById = new Map(allVenues.map((v) => [v.id, v.name]));

  return (
    <div>
      <div className="a-actions-row">
        <h1 className="a-h1" style={{ margin: 0 }}>
          Vouchers
        </h1>
        <a href="/admin/vouchers/new" className="clay-btn">
          New voucher
        </a>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Venue</th>
              <th>Discount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((voucher) => (
              <tr key={voucher.id}>
                <td>{voucher.title}</td>
                <td>{voucher.venueId ? venueNameById.get(voucher.venueId) ?? voucher.venueId : "—"}</td>
                <td>{voucher.discountType}</td>
                <td>
                  <form action={setVoucherActive} className="a-checkbox-row">
                    <input type="hidden" name="id" value={voucher.id} />
                    <input type="hidden" name="isActive" value={(!voucher.isActive).toString()} />
                    <span className={voucher.isActive ? "a-text-sage" : "a-text-orange"}>
                      {voucher.isActive ? "Active" : "Inactive"}
                    </span>
                    <button type="submit" className="a-btn-sm">
                      {voucher.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
                <td>
                  <a href={`/admin/vouchers/${voucher.id}`} className="a-link">
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
