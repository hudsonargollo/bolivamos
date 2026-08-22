import { createDb, vouchers } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";

export default async function HostVouchersPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(vouchers);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">BoliPass Vouchers</h1>

      {/* Placeholder form — needs client-side JS to POST JSON to /api/vouchers. */}
      <form action="/api/vouchers" method="post" className="max-w-md space-y-3">
        <input name="venueId" placeholder="Venue ID" className="w-full rounded-md border p-2" required />
        <input name="title" placeholder="e.g. 2-for-1 Main Course" className="w-full rounded-md border p-2" required />
        <textarea
          name="termsConditions"
          placeholder="Valid Tuesday-Thursday, 1 per table"
          className="w-full rounded-md border p-2"
        />
        <button type="submit" className="rounded-pill bg-boli-orange px-5 py-2 text-white">
          Create voucher
        </button>
      </form>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Venue</th>
            <th className="p-2">Active</th>
            <th className="p-2">QR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((voucher) => (
            <tr key={voucher.id} className="border-t">
              <td className="p-2">{voucher.title}</td>
              <td className="p-2">{voucher.venueId}</td>
              <td className="p-2">{voucher.isActive ? "Yes" : "No"}</td>
              <td className="p-2">
                <a href={`/host/qr/${voucher.venueId}`} className="text-boli-green underline">
                  View QR
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
