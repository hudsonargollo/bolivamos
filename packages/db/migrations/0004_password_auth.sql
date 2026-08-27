-- Adds password-based auth alongside the existing Google OAuth flow
-- (apps/web/lib/issue-session.ts). Column is nullable: every existing row
-- was created via OAuth/dev-login and has no password.
ALTER TABLE users ADD COLUMN password_hash TEXT;
