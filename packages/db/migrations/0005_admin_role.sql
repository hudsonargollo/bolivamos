-- Adds an 'admin' role for the internal admin dashboard (apps/web/app/admin).
-- SQLite can't ALTER a CHECK constraint, so the table is rebuilt with the
-- widened constraint and all existing rows are copied across unchanged.
--
-- 'admin' can only be granted by running an UPDATE directly against D1 --
-- it is never accepted as a client-supplied role at signup/login (see
-- packages/api-schema/src/schemas/common.ts's selfAssignableRoleSchema).
-- To promote an existing user (who must sign up/dev-login once first):
--   pnpm --filter @bolivamos/web exec wrangler d1 execute bolivamos-db --local \
--     --command "UPDATE users SET role='admin' WHERE email='REPLACE_WITH_EMAIL'"
-- (drop --local for the remote/production database once deployed).

CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK(role IN ('visitor', 'host', 'admin')) DEFAULT 'visitor',
    is_bolipass_active BOOLEAN DEFAULT FALSE,
    bolipass_expires_at DATETIME,
    preferences TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    password_hash TEXT
);

INSERT INTO users_new (id, email, full_name, role, is_bolipass_active, bolipass_expires_at, preferences, created_at, password_hash)
SELECT id, email, full_name, role, is_bolipass_active, bolipass_expires_at, preferences, created_at, password_hash FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;
