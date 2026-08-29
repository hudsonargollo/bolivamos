import { createDb, products } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";

const TYPE_LABELS: Record<string, string> = {
  tour: "Tour",
  audio_tour: "Audio tour",
  ticket: "Ticket",
};

export default async function AdminProductsPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(products);

  return (
    <div>
      <div className="a-actions-row">
        <h1 className="a-h1" style={{ margin: 0 }}>
          Marketplace products
        </h1>
        <a href="/admin/products/new" className="clay-btn">
          New product
        </a>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Price (BOB)</th>
              <th>Price (USD)</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>{TYPE_LABELS[product.type] ?? product.type}</td>
                <td>{product.priceBob.toFixed(2)}</td>
                <td>{product.priceUsd != null ? `$${product.priceUsd.toFixed(2)}` : "—"}</td>
                <td>{product.active ? <span className="a-text-sage">Active</span> : <span className="a-muted">Inactive</span>}</td>
                <td>
                  <a href={`/admin/products/${product.id}`} className="a-link">
                    Edit
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="a-muted" style={{ textAlign: "center", padding: 32 }}>
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
