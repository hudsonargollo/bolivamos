import { eq } from "@bolivibes/db";
import { createDb, users, type User } from "@bolivibes/db";
import { hashPassword, verifyPassword, type Role } from "@bolivibes/api-schema";
import { cf } from "./cloudflare";

export interface CreateUserWithPasswordInput {
  email: string;
  password: string;
  fullName?: string | null;
  role?: Role;
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("Email already registered");
    this.name = "EmailAlreadyRegisteredError";
  }
}

export async function createUserWithPassword(input: CreateUserWithPasswordInput): Promise<User> {
  const { env } = cf();
  const db = createDb(env.DB);

  const [existing] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existing) throw new EmailAlreadyRegisteredError();

  const passwordHash = await hashPassword(input.password);
  const id = crypto.randomUUID();
  await db.insert(users).values({
    id,
    email: input.email,
    fullName: input.fullName ?? null,
    role: input.role ?? "visitor",
    passwordHash,
  });

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function verifyUserPassword(email: string, password: string): Promise<User | null> {
  const { env } = cf();
  const db = createDb(env.DB);

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user?.passwordHash) return null;
  return (await verifyPassword(password, user.passwordHash)) ? user : null;
}
