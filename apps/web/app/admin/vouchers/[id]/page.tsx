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
    <div>
      <h1 className="a-h1">Edit voucher</h1>
      <form action={updateVoucher} className="a-form a-card">
        <input type="hidden" name="id" value={voucher.id} />
        <select name="venueId" defaultValue={voucher.venueId ?? ""} required className="a-select">
          <option value="">Select a venue</option>
          {allVenues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <input name="title" defaultValue={voucher.title} required className="a-input" />
        <input
          name="discountType"
          defaultValue={voucher.discountType ?? "2_FOR_1"}
          placeholder="Discount type"
          className="a-input"
        />
        <textarea name="termsConditions" defaultValue={voucher.termsConditions ?? ""} className="a-textarea" />
        <label className="a-checkbox-row">
          <input type="checkbox" name="isActive" defaultChecked={Boolean(voucher.isActive)} /> Active
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Save changes
        </button>
      </form>

      <form action={deleteVoucher} style={{ marginTop: 20 }}>
        <input type="hidden" name="id" value={voucher.id} />
        <button type="submit" className="clay-btn clay-danger">
          Delete voucher
        </button>
      </form>
    </div>
  );
}
