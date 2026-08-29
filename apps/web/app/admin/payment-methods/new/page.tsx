import { createPaymentMethod } from "../../actions/payment-methods";

export default function NewPaymentMethodPage() {
  return (
    <div>
      <h1 className="a-h1">New payment method</h1>
      <form action={createPaymentMethod} className="a-form a-card" style={{ maxWidth: 520 }}>
        <div className="a-field">
          <label htmlFor="method">Method</label>
          <select id="method" name="method" required className="a-select">
            <option value="qr_bolivia">QR Bolivia</option>
            <option value="qr_pix">QR PIX (Brazil)</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
        <div className="a-field">
          <label htmlFor="label">Label</label>
          <input id="label" name="label" placeholder="e.g. Banco Union QR" required className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="qrImageUrl">
            QR image URL <span className="a-field-optional">(for QR methods)</span>
          </label>
          <input id="qrImageUrl" name="qrImageUrl" className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="addressOrKey">
            Address / key <span className="a-field-optional">(PIX key, wallet address)</span>
          </label>
          <input id="addressOrKey" name="addressOrKey" className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="instructions">Instructions shown to the buyer</label>
          <textarea id="instructions" name="instructions" className="a-textarea" />
        </div>
        <label className="a-checkbox-row">
          <input type="checkbox" name="active" defaultChecked /> Active
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Create method
        </button>
      </form>
    </div>
  );
}
