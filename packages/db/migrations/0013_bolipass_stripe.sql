-- Real BoliPass billing: Stripe recurring subscription ($50/3mo, $25 with a
-- self-attested + format-checked Bolivian NIT). See
-- apps/web/app/api/subscriptions/bolipass/checkout/route.ts and
-- apps/web/app/api/webhooks/stripe/route.ts.
ALTER TABLE users ADD COLUMN nit TEXT;
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;

CREATE UNIQUE INDEX users_stripe_subscription_id_idx ON users(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
