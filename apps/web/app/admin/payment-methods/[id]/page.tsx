import { notFound } from "next/navigation";
import { createDb, paymentMethods } from "@bolivamos/db";
import { eq } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { updatePaymentMethod, deletePaymentMethod } from "../../actions/payment-methods";

export default async function EditPaymentMethodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);

  const [pm] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id)).limit(1);
  if (!pm) notFound();

  return (
    <div>
      <h1 className="a-h1">Edit payment method</h1>
      <form action={updatePaymentMethod} className="a-form a-card" style={{ maxWidth: 520 }}>
        <input type="hidden" name="id" value={pm.id} />
        <div className="a-field">
          <label htmlFor="method">Method</label>
          <select id="method" name="method" defaultValue={pm.method} required className="a-select">
            <option value="qr_bolivia">QR Bolivia</option>
            <option value="qr_pix">QR PIX (Brazil)</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
        <div className="a-field">
          <label htmlFor="label">Label</label>
          <input id="label" name="label" defaultValue={pm.label} required className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="qrImageUrl">QR image URL</label>
          <input id="qrImageUrl" name="qrImageUrl" defaultValue={pm.qrImageUrl ?? ""} className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="addressOrKey">Address / key</label>
          <input id="addressOrKey" name="addressOrKey" defaultValue={pm.addressOrKey ?? ""} className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="instructions">Instructions shown to the buyer</label>
          <textarea id="instructions" name="instructions" defaultValue={pm.instructions ?? ""} className="a-textarea" />
        </div>
        <label className="a-checkbox-row">
          <input type="checkbox" name="active" defaultChecked={Boolean(pm.active)} /> Active
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Save changes
        </button>
      </form>

      <form action={deletePaymentMethod} style={{ marginTop: 20 }}>
        <input type="hidden" name="id" value={pm.id} />
        <button type="submit" className="clay-btn clay-danger">
          Delete method
        </button>
      </form>
    </div>
  );
}
