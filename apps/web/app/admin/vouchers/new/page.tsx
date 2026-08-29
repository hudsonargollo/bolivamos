import { createDb, venues } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { createVoucher } from "../../actions/vouchers";

export default async function NewVoucherPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const allVenues = await db.select().from(venues);

  return (
    <div>
      <h1 className="a-h1">New voucher</h1>
      <form action={createVoucher} className="a-form a-card" style={{ maxWidth: 520 }}>
        <div className="a-field">
          <label htmlFor="venueId">Venue</label>
          <select id="venueId" name="venueId" required className="a-select">
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
          <input id="title" name="title" placeholder="e.g. 2-for-1 Main Course" required className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="discountType">Discount type</label>
          <input id="discountType" name="discountType" defaultValue="2_FOR_1" className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="termsConditions">Terms &amp; conditions</label>
          <textarea id="termsConditions" name="termsConditions" placeholder="Valid Tuesday-Thursday, 1 per table" className="a-textarea" />
        </div>
        <label className="a-checkbox-row">
          <input type="checkbox" name="isActive" defaultChecked /> Active
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Create voucher
        </button>
      </form>
    </div>
  );
}
