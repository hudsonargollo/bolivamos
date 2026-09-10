"use client";

import { useState } from "react";
import type { CreateOrderResponse, OrderPaymentMethod, ProductDto } from "@bolivibes/api-schema";

export default function Checkout({ product }: { product: ProductDto }) {
  const [method, setMethod] = useState<OrderPaymentMethod>(product.priceUsd ? "stripe" : "qr_bolivia");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateOrderResponse | null>(null);

  async function handleBuy() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1, paymentMethod: method }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Couldn't start checkout. Try again.");
        return;
      }
      const data = (await res.json()) as CreateOrderResponse;
      if (data.stripeCheckoutUrl) {
        window.location.href = data.stripeCheckoutUrl;
        return;
      }
      setResult(data);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.paymentInstructions) {
    const pm = result.paymentInstructions;
    return (
      <div className="a-card" style={{ marginTop: 20 }}>
        <p style={{ fontWeight: 700, marginTop: 0 }}>Pay via {pm.label}</p>
        {pm.qrImageUrl && (
          <img src={pm.qrImageUrl} alt={`${pm.label} QR code`} style={{ maxWidth: 220, borderRadius: 12 }} />
        )}
        {pm.addressOrKey && <p style={{ fontFamily: "monospace", fontSize: 13 }}>{pm.addressOrKey}</p>}
        {pm.instructions && <p className="a-muted">{pm.instructions}</p>}
        <p className="a-muted" style={{ fontSize: 13 }}>
          Order #{result.order.id.slice(0, 8)} is pending — it'll be marked paid once we confirm your payment.
        </p>
      </div>
    );
  }

  return (
    <div className="a-card" style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="a-field">
        <label htmlFor="method">Pay with</label>
        <select
          id="method"
          className="a-select"
          value={method}
          onChange={(e) => setMethod(e.target.value as OrderPaymentMethod)}
        >
          {product.priceUsd != null && <option value="stripe">Credit/debit card (Stripe)</option>}
          <option value="qr_bolivia">QR Bolivia</option>
          <option value="qr_pix">QR PIX (Brazil)</option>
          <option value="crypto">Crypto</option>
        </select>
      </div>
      {error && (
        <p className="a-text-orange" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
      <button type="button" onClick={handleBuy} disabled={submitting} className="clay-btn" style={{ alignSelf: "flex-start" }}>
        {submitting ? "Starting checkout…" : `Buy — ${product.priceBob.toFixed(2)} BOB`}
      </button>
    </div>
  );
}
