/**
 * Thin wrapper around the Stripe REST API — no SDK dependency, same pattern
 * as packages/ai/src/gemini-client.ts. The secret key is always injected by
 * the caller (from env.STRIPE_SECRET_KEY inside a Cloudflare Worker).
 *
 * Stripe doesn't settle in BOB, so checkout charges in USD — products.priceUsd
 * must be set for a product to be purchasable via Stripe (see
 * app/api/orders/route.ts).
 */

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export interface CreateCheckoutSessionParams {
  secretKey: string;
  orderId: string;
  productTitle: string;
  amountUsd: number;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<StripeCheckoutSession> {
  const body = new URLSearchParams({
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    "line_items[0][quantity]": String(params.quantity),
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(Math.round(params.amountUsd * 100)),
    "line_items[0][price_data][product_data][name]": params.productTitle,
    "metadata[orderId]": params.orderId,
  });

  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Stripe checkout session creation failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { id: string; url: string };
  return { id: json.id, url: json.url };
}

const WEBHOOK_TOLERANCE_SECONDS = 300;

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verifies a Stripe webhook's `Stripe-Signature` header against the raw request body. */
export async function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string,
  webhookSecret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > WEBHOOK_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedPayload = `${timestamp}.${payload}`;
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  return timingSafeEqualHex(toHex(digest), signature);
}
