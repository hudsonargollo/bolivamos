import { createDb, products } from "@bolivibes/db";
import { eq } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";

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
    <main className="bv-app-shell">
      <section className="bv-container">
        <p className="bv-section-kicker">Marketplace</p>
        <h1 className="bv-title">Tours, audio guides &amp; tickets</h1>
        <p className="bv-subtitle">Book the city like the app: warm cards, clear prices, and quick actions.</p>
        <div className="bv-grid">
          {rows.map((product) => (
            <a key={product.id} href={`/marketplace/${product.id}`} className="bv-card bv-card-pad">
              <span className="bv-chip">{TYPE_LABELS[product.type] ?? product.type}</span>
              <p className="bv-card-title" style={{ margin: "12px 0 0" }}>{product.title}</p>
              <p className="bv-card-meta">{product.priceBob.toFixed(2)} BOB</p>
            </a>
          ))}
          {rows.length === 0 && <p className="bv-subtitle">Nothing listed yet — check back soon.</p>}
        </div>
      </section>
    </main>
  );
}
