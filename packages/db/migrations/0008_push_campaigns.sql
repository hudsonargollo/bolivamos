-- Lock-screen push campaigns (roadmap pillar 2). Broadcast-to-a-segment, not
-- true geofenced targeting — packages/notifications/src/push/geofence-alerts.ts
-- already documents proximity computation as out of scope for this scaffold.
CREATE TABLE push_campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target TEXT NOT NULL DEFAULT 'all' CHECK(target IN ('all', 'vip', 'host')),
    sent_at DATETIME,
    recipient_count INTEGER,
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
