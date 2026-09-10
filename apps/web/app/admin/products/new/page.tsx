import { createDb, events } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { createProduct } from "../../actions/products";

export default async function NewProductPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const allEvents = await db.select().from(events);

  return (
    <div>
      <h1 className="a-h1">New product</h1>
      <form action={createProduct} className="a-form a-card" style={{ maxWidth: 520 }}>
        <div className="a-field">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" required className="a-select">
            <option value="tour">Tour</option>
            <option value="audio_tour">Self-guided audio tour</option>
            <option value="ticket">Event ticket</option>
          </select>
        </div>
        <div className="a-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" className="a-textarea" />
        </div>
        <div className="a-row-2">
          <div className="a-field">
            <label htmlFor="priceBob">Price (BOB)</label>
            <input id="priceBob" name="priceBob" type="number" step="0.01" required className="a-input" />
          </div>
          <div className="a-field">
            <label htmlFor="priceUsd">
              Price (USD) <span className="a-field-optional">for card payment</span>
            </label>
            <input id="priceUsd" name="priceUsd" type="number" step="0.01" className="a-input" />
          </div>
        </div>
        <div className="a-field">
          <label htmlFor="eventId">
            Linked event <span className="a-field-optional">(for tickets)</span>
          </label>
          <select id="eventId" name="eventId" className="a-select">
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
          <input id="audioUrl" name="audioUrl" className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="capacity">
            Capacity <span className="a-field-optional">(for tours)</span>
          </label>
          <input id="capacity" name="capacity" type="number" className="a-input" />
        </div>
        <label className="a-checkbox-row">
          <input type="checkbox" name="active" defaultChecked /> Active (visible in the marketplace)
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Create product
        </button>
      </form>
    </div>
  );
}
