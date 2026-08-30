import { notFound } from "next/navigation";
import { createDb, events, products } from "@bolivamos/db";
import { eq } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { updateProduct, deleteProduct } from "../../actions/products";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);

  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();

  const allEvents = await db.select().from(events);

  return (
    <div>
      <h1 className="a-h1">Edit product</h1>
      <form action={updateProduct} className="a-form a-card" style={{ maxWidth: 520 }}>
        <input type="hidden" name="id" value={product.id} />
        <div className="a-field">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={product.type} required className="a-select">
            <option value="tour">Tour</option>
            <option value="audio_tour">Self-guided audio tour</option>
            <option value="ticket">Event ticket</option>
          </select>
        </div>
        <div className="a-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={product.title} required className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" defaultValue={product.description ?? ""} className="a-textarea" />
        </div>
        <div className="a-row-2">
          <div className="a-field">
            <label htmlFor="priceBob">Price (BOB)</label>
            <input
              id="priceBob"
              name="priceBob"
              type="number"
              step="0.01"
              defaultValue={product.priceBob}
              required
              className="a-input"
            />
          </div>
          <div className="a-field">
            <label htmlFor="priceUsd">
              Price (USD) <span className="a-field-optional">for card payment</span>
            </label>
            <input
              id="priceUsd"
              name="priceUsd"
              type="number"
              step="0.01"
              defaultValue={product.priceUsd ?? ""}
              className="a-input"
            />
          </div>
        </div>
        <div className="a-field">
          <label htmlFor="eventId">
            Linked event <span className="a-field-optional">(for tickets)</span>
          </label>
          <select id="eventId" name="eventId" defaultValue={product.eventId ?? ""} className="a-select">
            <option value="">No linked event</option>
            {allEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        <div className="a-field">
          <label htmlFor="audioUrl">
            Audio URL <span className="a-field-optional">(for audio tours)</span>
          </label>
          <input id="audioUrl" name="audioUrl" defaultValue={product.audioUrl ?? ""} className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="capacity">
            Capacity <span className="a-field-optional">(for tours)</span>
          </label>
          <input id="capacity" name="capacity" type="number" defaultValue={product.capacity ?? ""} className="a-input" />
        </div>
        <label className="a-checkbox-row">
          <input type="checkbox" name="active" defaultChecked={Boolean(product.active)} /> Active (visible in the
          marketplace)
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Save changes
        </button>
      </form>

      <form action={deleteProduct} style={{ marginTop: 20 }}>
        <input type="hidden" name="id" value={product.id} />
        <button type="submit" className="clay-btn clay-danger">
          Delete product
        </button>
      </form>
    </div>
  );
}
