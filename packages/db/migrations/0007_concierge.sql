-- AI Concierge conversation persistence (roadmap pillar 1). The chat endpoint
-- was stateless before this — every call resent the full history from the
-- client. This lets a conversation survive across sessions/devices.
CREATE TABLE concierge_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE concierge_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES concierge_conversations(id),
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_concierge_conversations_user ON concierge_conversations(user_id);
CREATE INDEX idx_concierge_messages_conversation ON concierge_messages(conversation_id);
