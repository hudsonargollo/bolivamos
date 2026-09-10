import { notFound } from "next/navigation";
import { createDb, products } from "@bolivibes/db";
import { eq } from "@bolivibes/db";
import type { ProductDto } from "@bolivibes/api-schema";
import { cf } from "@/lib/cloudflare";
import "../../admin/admin.css";
import Checkout from "./checkout";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);

  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product || !product.active) notFound();

  const dto: ProductDto = {
    id: product.id,
    type: product.type as ProductDto["type"],
    hostId: product.hostId,
    eventId: product.eventId,
    title: product.title,
    description: product.description,
    priceBob: product.priceBob,
    priceUsd: product.priceUsd,
    audioUrl: product.audioUrl,
    capacity: product.capacity,
    active: product.active,
    createdAt: product.createdAt,
  };

  return (
    <div className="admin-root" style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 className="a-h1">{product.title}</h1>
        {product.description && <p className="a-muted">{product.description}</p>}
        <p style={{ fontWeight: 700, fontSize: 20 }}>
          {product.priceBob.toFixed(2)} BOB{product.priceUsd != null && ` · $${product.priceUsd.toFixed(2)}`}
        </p>
        <Checkout product={dto} />
      </div>
    </div>
  );
}
