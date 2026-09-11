-- Place metadata for richer BoliVibes guide cards and shareable Google location links.
ALTER TABLE places ADD COLUMN description TEXT;
ALTER TABLE places ADD COLUMN address TEXT;
ALTER TABLE places ADD COLUMN google_maps_url TEXT;
ALTER TABLE places ADD COLUMN website_url TEXT;
ALTER TABLE places ADD COLUMN phone TEXT;

-- Make the BOLITOURS offer discoverable on the public map as a verified tour.
INSERT INTO places (
  id,
  name,
  layer,
  category,
  district,
  lat,
  lng,
  rating,
  reviews,
  price,
  regional,
  venue_id,
  source,
  verified,
  description,
  address,
  google_maps_url
) VALUES (
  'bolitours-torito-city-tour',
  'BOLITOURS Torito City Tour',
  'tour',
  'Guided city tour',
  'Centro',
  -17.7832547,
  -63.1821187,
  NULL,
  0,
  '$50',
  FALSE,
  NULL,
  'manual',
  TRUE,
  'Hire a Torito with a local guide for a relaxed Santa Cruz city tour. Designed for friends, visitors and expats who want an easy guided route through the city highlights.',
  'Plaza 24 de Septiembre, Santa Cruz de la Sierra, Bolivia',
  'https://www.google.com/maps/search/?api=1&query=Plaza%2024%20de%20Septiembre%20Santa%20Cruz%20de%20la%20Sierra%20Bolivia'
) ON CONFLICT(id) DO UPDATE SET
  name=excluded.name,
  layer=excluded.layer,
  category=excluded.category,
  district=excluded.district,
  lat=excluded.lat,
  lng=excluded.lng,
  price=excluded.price,
  regional=excluded.regional,
  source=excluded.source,
  verified=excluded.verified,
  description=excluded.description,
  address=excluded.address,
  google_maps_url=excluded.google_maps_url;

-- Launch seed for BOLITOURS: guided Torito city tour at $50.
INSERT INTO products (
  id,
  type,
  title,
  description,
  price_bob,
  price_usd,
  capacity,
  active
) VALUES (
  'bolitours-torito-city-tour',
  'tour',
  'BOLITOURS Torito City Tour',
  'Hire a Torito with a local guide for a warm, photo-friendly tour around Santa Cruz de la Sierra. Great for visitors, expats and friends who want the city highlights without planning the route.',
  348,
  50,
  2,
  TRUE
) ON CONFLICT(id) DO UPDATE SET
  type=excluded.type,
  title=excluded.title,
  description=excluded.description,
  price_bob=excluded.price_bob,
  price_usd=excluded.price_usd,
  capacity=excluded.capacity,
  active=excluded.active;
