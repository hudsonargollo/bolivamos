-- Cheapest near-term wins from the monetization roadmap: an invite-only VIP
-- flag on events (backs "exclusive VIP-only community parties"), a featured
-- flag on venues/events (backs paid placement in "Best Bars" / "This
-- Weekend"), and a manually-toggled B2B tier on venues (backs the $30-100/mo
-- SaaS tier until real billing exists to drive it automatically).
ALTER TABLE venues ADD COLUMN tier TEXT DEFAULT 'free';
ALTER TABLE venues ADD COLUMN featured BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN is_vip_only BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN featured BOOLEAN DEFAULT FALSE;
