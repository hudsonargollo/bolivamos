import { createDb, products } from "@bolivibes/db";
import { eq } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import "../admin/admin.css";

// No dynamic segment and no cookies() call here, so Next would otherwise try
// to statically prerender this at build time — which breaks, since D1/KV
// bindings (via cf()) only exist inside a real request.
export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  tour: "Tour",
  audio_tour: "Audio tour",
  ticket: "Ticket",
};

export default async function MarketplacePage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(products).where(eq(products.active, true));

  return (
    <div className="admin-root" style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <h1 className="a-h1">Tours, audio guides &amp; tickets</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {rows.map((product) => (
            <a
              key={product.id}
              href={`/marketplace/${product.id}`}
              className="a-card"
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <span className="a-badge a-badge-sage" style={{ marginLeft: 0 }}>
                {TYPE_LABELS[product.type] ?? product.type}
              </span>
              <p style={{ fontWeight: 700, margin: "10px 0 4px" }}>{product.title}</p>
              <p className="a-muted" style={{ margin: 0 }}>
                {product.priceBob.toFixed(2)} BOB
              </p>
            </a>
          ))}
          {rows.length === 0 && <p className="a-muted">Nothing listed yet — check back soon.</p>}
        </div>
      </div>
    </div>
  );
}
