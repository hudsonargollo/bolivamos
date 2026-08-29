import { createDb, paymentMethods } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";

const METHOD_LABELS: Record<string, string> = {
  qr_bolivia: "QR Bolivia",
  qr_pix: "QR PIX (Brazil)",
  crypto: "Crypto",
};

export default async function AdminPaymentMethodsPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(paymentMethods);

  return (
    <div>
      <div className="a-actions-row">
        <h1 className="a-h1" style={{ margin: 0 }}>
          Payment methods
        </h1>
        <a href="/admin/payment-methods/new" className="clay-btn">
          New method
        </a>
      </div>
      <p className="a-muted" style={{ marginTop: -12, marginBottom: 20 }}>
        Receiving details for the manually-confirmed rails (QR Bolivia, QR PIX, crypto). Stripe card payments are
        automatic and don't need an entry here — set <code>STRIPE_SECRET_KEY</code> /{" "}
        <code>STRIPE_WEBHOOK_SECRET</code> as Worker secrets instead.
      </p>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Method</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((pm) => (
              <tr key={pm.id}>
                <td>{pm.label}</td>
                <td>{METHOD_LABELS[pm.method] ?? pm.method}</td>
                <td>{pm.active ? <span className="a-text-sage">Active</span> : <span className="a-muted">Inactive</span>}</td>
                <td>
                  <a href={`/admin/payment-methods/${pm.id}`} className="a-link">
                    Edit
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="a-muted" style={{ textAlign: "center", padding: 32 }}>
                  No payment methods configured yet — buyers can't check out with QR/crypto until one exists.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
