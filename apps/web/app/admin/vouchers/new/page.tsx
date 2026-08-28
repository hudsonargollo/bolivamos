import { createDb, venues } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { createVoucher } from "../../actions/vouchers";

export default async function NewVoucherPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const allVenues = await db.select().from(venues);

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl uppercase">New voucher</h1>
      <form action={createVoucher} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <select name="venueId" required className="w-full rounded-md border p-2">
          <option value="">Select a venue</option>
          {allVenues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <input name="title" placeholder="e.g. 2-for-1 Main Course" required className="w-full rounded-md border p-2" />
        <input
          name="discountType"
          defaultValue="2_FOR_1"
          placeholder="Discount type"
          className="w-full rounded-md border p-2"
        />
        <textarea
          name="termsConditions"
          placeholder="Valid Tuesday-Thursday, 1 per table"
          className="w-full rounded-md border p-2"
        />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked /> Active
        </label>
        <button type="submit" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          Create voucher
        </button>
      </form>
    </div>
  );
}
