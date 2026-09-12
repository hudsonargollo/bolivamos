#!/usr/bin/env node
// Creates (or upserts a password onto) a password-auth user row directly in
// remote D1, for cases where hitting POST /api/auth/signup isn't convenient
// (e.g. seeding test/staff accounts before the app is redeployed). Mirrors
// the hashing in packages/api-schema/src/password.ts exactly (PBKDF2-SHA256,
// 100k iterations, `pbkdf2$<iterations>$<saltHex>$<hashHex>`) so these rows
// verify correctly against POST /api/auth/login.
//
// Run: node packages/db/scripts/create-user.mjs <email> <password> [role]
//   role defaults to "visitor"; valid roles are "visitor", "host", or "admin".

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.join(__dirname, "../../../apps/web");
const PBKDF2_ITERATIONS = 100_000;

function toHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(new Uint8Array(bits))}`;
}

function sqlString(v) {
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  const [email, password, role = "visitor"] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: node create-user.mjs <email> <password> [visitor|host|admin]");
    process.exit(1);
  }
  if (!["visitor", "host", "admin"].includes(role)) {
    console.error(`Invalid role "${role}" — must be "visitor", "host", or "admin".`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const execOpts = {
    cwd: WEB_DIR,
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: "cb27e1a67198789eb42d11ab90737652" },
    maxBuffer: 10 * 1024 * 1024,
  };

  // execFileSync (no shell) so the `$` in `pbkdf2$<iterations>$<salt>$<hash>`
  // never gets shell-expanded the way it would inside a quoted execSync
  // string — that bug corrupted the first attempt at seeding these rows.
  function d1(sql, extraArgs = []) {
    return execFileSync(
      "npx",
      ["wrangler", "d1", "execute", "bolivamos-db", "--remote", "--command", sql, ...extraArgs],
      execOpts,
    );
  }

  const existingRaw = d1(`SELECT id FROM users WHERE email = ${sqlString(email)}`, ["--json"]);
  const existing = JSON.parse(existingRaw.toString())[0].results;

  if (existing.length) {
    const id = existing[0].id;
    d1(`UPDATE users SET password_hash = ${sqlString(passwordHash)}, role = ${sqlString(role)} WHERE id = ${sqlString(id)}`);
    console.log(`Updated password and role=${role} for existing user ${email} (${id}).`);
  } else {
    const id = crypto.randomUUID();
    d1(
      `INSERT INTO users (id, email, role, password_hash) VALUES (${sqlString(id)}, ${sqlString(email)}, ${sqlString(role)}, ${sqlString(passwordHash)})`,
    );
    console.log(`Created user ${email} (${id}), role=${role}.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
