-- VIP Connect & Dating (roadmap pillar 1). Matching/messaging ships together
-- with block/report — not as a later add-on — per explicit direction: real
-- people, real safety stakes.
ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;

CREATE TABLE event_attendance (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    visible BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

CREATE TABLE connect_requests (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id),
    from_user_id TEXT NOT NULL REFERENCES users(id),
    to_user_id TEXT NOT NULL REFERENCES users(id),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE connect_messages (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES connect_requests(id),
    sender_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_blocks (
    id TEXT PRIMARY KEY,
    blocker_id TEXT NOT NULL REFERENCES users(id),
    blocked_id TEXT NOT NULL REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE user_reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL REFERENCES users(id),
    reported_id TEXT NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    context TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'reviewed', 'dismissed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_connect_requests_event ON connect_requests(event_id);
CREATE INDEX idx_connect_messages_request ON connect_messages(request_id);
CREATE INDEX idx_user_reports_status ON user_reports(status);
