-- Single-value admin config for the Analytics dashboard's MRR/ARR
-- projection — BoliPass has no real recorded price (activation just flips
-- is_bolipass_active, no payment integration), so this is admin-entered
-- rather than derived from actual billing data.
CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
