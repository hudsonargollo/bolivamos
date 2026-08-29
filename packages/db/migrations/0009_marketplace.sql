-- Tours & Ticketing Marketplace (roadmap pillar 3). One generalized product/
-- order model covers all three roadmap sub-items (tours, audio tours, event
-- ticketing) instead of triplicating near-identical CRUD.
--
-- Payment methods: Stripe (real Checkout integration, needs STRIPE_SECRET_KEY
-- / STRIPE_WEBHOOK_SECRET to actually charge anyone) plus QR Bolivia, QR PIX,
-- and crypto as manually-confirmed rails (admin uploads receiving QR/address
-- details in payment_methods; buyer pays externally and an admin flips the
-- order to 'paid' from /admin/orders) — no one API covers all three, and none
-- of them are mine to pick without the user choosing a specific gateway/PSP.
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('tour', 'audio_tour', 'ticket')),
    host_id TEXT REFERENCES users(id),
    event_id TEXT REFERENCES events(id),
    title TEXT NOT NULL,
    description TEXT,
    price_bob REAL NOT NULL,
    -- Stripe doesn't settle in BOB — required for the Stripe checkout path;
    -- the manual QR/crypto rails go by price_bob directly.
    price_usd REAL,
    audio_url TEXT,
    capacity INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_methods (
    id TEXT PRIMARY KEY,
    method TEXT NOT NULL CHECK(method IN ('qr_bolivia', 'qr_pix', 'crypto')),
    label TEXT NOT NULL,
    qr_image_url TEXT,
    address_or_key TEXT,
    instructions TEXT,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    quantity INTEGER DEFAULT 1,
    total_price_bob REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('stripe', 'qr_bolivia', 'qr_pix', 'crypto')),
    reference_note TEXT,
    stripe_session_id TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
