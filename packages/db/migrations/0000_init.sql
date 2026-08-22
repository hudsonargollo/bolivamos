-- Cloudflare D1 Relational Schema

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK(role IN ('visitor', 'host')) DEFAULT 'visitor',
    is_bolipass_active BOOLEAN DEFAULT FALSE,
    bolipass_expires_at DATETIME,
    preferences TEXT, -- JSON array of selected categories
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venues (
    id TEXT PRIMARY KEY,
    host_id TEXT REFERENCES users(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT,
    latitude REAL,
    longitude REAL,
    qr_secret_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id TEXT PRIMARY KEY,
    venue_id TEXT REFERENCES venues(id),
    title TEXT NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    image_url TEXT
);

CREATE TABLE vouchers (
    id TEXT PRIMARY KEY,
    venue_id TEXT REFERENCES venues(id),
    title TEXT NOT NULL,
    discount_type TEXT DEFAULT '2_FOR_1',
    terms_conditions TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE redemptions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    voucher_id TEXT REFERENCES vouchers(id),
    saved_amount_bob REAL,
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
