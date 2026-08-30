import { notFound } from "next/navigation";
import { createDb, venues, vouchers } from "@bolivamos/db";
import { eq } from "@bolivamos/db";
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
      <form action={updateVoucher} className="a-form a-card" style={{ maxWidth: 520 }}>
        <input type="hidden" name="id" value={voucher.id} />
        <div className="a-field">
          <label htmlFor="venueId">Venue</label>
          <select id="venueId" name="venueId" defaultValue={voucher.venueId ?? ""} required className="a-select">
            <option value="">Select a venue</option>
            {allVenues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </div>
        <div className="a-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={voucher.title} required className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="discountType">Discount type</label>
          <input id="discountType" name="discountType" defaultValue={voucher.discountType ?? "2_FOR_1"} className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="termsConditions">Terms &amp; conditions</label>
          <textarea id="termsConditions" name="termsConditions" defaultValue={voucher.termsConditions ?? ""} className="a-textarea" />
        </div>
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
