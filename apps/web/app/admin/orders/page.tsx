import { createDb, orders, products, users } from "@bolivamos/db";
import { desc } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { confirmOrder, cancelOrder } from "../actions/orders";

const METHOD_LABELS: Record<string, string> = {
  stripe: "Stripe (card)",
  qr_bolivia: "QR Bolivia",
  qr_pix: "QR PIX",
  crypto: "Crypto",
};

export default async function AdminOrdersPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const [rows, allProducts, allUsers] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(products),
    db.select().from(users),
  ]);
  const productById = new Map(allProducts.map((p) => [p.id, p]));
  const userById = new Map(allUsers.map((u) => [u.id, u]));

  return (
    <div>
      <h1 className="a-h1">Orders</h1>
      <p className="a-muted" style={{ marginTop: -12, marginBottom: 20 }}>
        Stripe orders confirm themselves automatically via webhook once payment succeeds. QR Bolivia / QR PIX /
        crypto orders need a manual confirm here once you've verified the payment landed.
      </p>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Buyer</th>
              <th>Total (BOB)</th>
              <th>Method</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id}>
                <td>{productById.get(order.productId)?.title ?? order.productId}</td>
                <td>{userById.get(order.userId)?.email ?? order.userId}</td>
                <td>{order.totalPriceBob.toFixed(2)}</td>
                <td>{METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</td>
                <td>
                  {order.status === "paid" && <span className="a-text-sage">Paid</span>}
                  {order.status === "cancelled" && <span className="a-muted">Cancelled</span>}
                  {order.status === "pending" && <span className="a-text-orange">Pending</span>}
                </td>
                <td>
                  {order.status === "pending" && order.paymentMethod !== "stripe" && (
                    <div className="a-checkbox-row">
                      <form action={confirmOrder}>
                        <input type="hidden" name="id" value={order.id} />
                        <button type="submit" className="a-btn-sm">
                          Confirm paid
                        </button>
                      </form>
                      <form action={cancelOrder}>
                        <input type="hidden" name="id" value={order.id} />
                        <button type="submit" className="a-btn-sm">
                          Cancel
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="a-muted" style={{ textAlign: "center", padding: 32 }}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
