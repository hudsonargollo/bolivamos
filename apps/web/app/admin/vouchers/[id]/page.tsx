import { notFound } from "next/navigation";
import { createDb, venues, vouchers } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { cf } from "@/lib/cloudflare";
import { updateVoucher, deleteVoucher } from "../../actions/vouchers";

export default async function EditVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);

  const [voucher] = await db.select().from(vouchers).where(eq(vouchers.id, id)).limit(1);
  if (!voucher) notFound();

  const allVenues = await db.select().from(venues);

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl uppercase">Edit voucher</h1>
      <form action={updateVoucher} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={voucher.id} />
        <select name="venueId" defaultValue={voucher.venueId ?? ""} required className="w-full rounded-md border p-2">
          <option value="">Select a venue</option>
          {allVenues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <input name="title" defaultValue={voucher.title} required className="w-full rounded-md border p-2" />
        <input
          name="discountType"
          defaultValue={voucher.discountType ?? "2_FOR_1"}
          placeholder="Discount type"
          className="w-full rounded-md border p-2"
        />
        <textarea
          name="termsConditions"
          defaultValue={voucher.termsConditions ?? ""}
          className="w-full rounded-md border p-2"
        />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked={Boolean(voucher.isActive)} /> Active
        </label>
        <button type="submit" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          Save changes
        </button>
      </form>

      <form action={deleteVoucher}>
        <input type="hidden" name="id" value={voucher.id} />
        <button type="submit" className="rounded-pill bg-boli-red px-5 py-2 text-white">
          Delete voucher
        </button>
      </form>
    </div>
  );
}
