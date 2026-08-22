import { eq } from "drizzle-orm";
import { createDb, users, type User } from "@bolivamos/db";
import { signSession, sessionKey, type Role } from "@bolivamos/api-schema";
import { cf } from "./cloudflare";

export interface IssueSessionInput {
  email: string;
  fullName?: string | null;
  role?: Role;
}

/**
 * Shared upsert-user + sign-JWT + write-KV-session flow used by every login
 * path (Google web callback, Google mobile id_token exchange, dev-login).
 */
export async function issueSessionForUser(input: IssueSessionInput): Promise<{ token: string; user: User }> {
  const { env } = cf();
  const db = createDb(env.DB);

  let [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

  if (!user) {
    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      email: input.email,
      fullName: input.fullName ?? null,
      role: input.role ?? "visitor",
    });
    [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  }

  if (!user) throw new Error("Failed to create or load user");

  const token = await signSession(
    {
      sub: user.id,
      email: user.email,
      role: (user.role ?? "visitor") as Role,
      isBoliPass: Boolean(user.isBolipassActive),
    },
    env.JWT_SECRET,
  );

  await env.BOLIVAMOS_KV.put(
    sessionKey(token),
    JSON.stringify({
      userId: user.id,
      role: user.role ?? "visitor",
      isBoliPass: Boolean(user.isBolipassActive),
    }),
    { expirationTtl: 60 * 60 * 24 * 30 },
  );

  return { token, user };
}
