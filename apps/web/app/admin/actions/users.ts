"use server";

import { eq } from "@bolivibes/db";
import { createDb, users } from "@bolivibes/db";
import { hashPassword } from "@bolivibes/api-schema";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString, formOptionalString } from "./require-admin";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeDate(value: string | null | undefined) {
  return value?.trim() ? value.trim() : null;
}

export async function createAdminUser(formData: FormData) {
  await requireAdminAction();

  const email = normalizeEmail(formString(formData, "email"));
  const password = formString(formData, "password");
  const fullName = formOptionalString(formData, "fullName")?.trim() || null;
  const role = formString(formData, "role");
  const isBolipassActive = formData.get("isBolipassActive") === "on";
  const bolipassExpiresAt = normalizeDate(formOptionalString(formData, "bolipassExpiresAt"));

  if (!email || !password || password.length < 8) {
    throw new Error("Email and an 8+ character password are required");
  }
  if (role !== "visitor" && role !== "host") {
    throw new Error("Invalid role");
  }

  const { env } = cf();
  const db = createDb(env.DB);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new Error("A user with this email already exists");

  await db.insert(users).values({
    id: crypto.randomUUID(),
    email,
    fullName,
    role,
    passwordHash: await hashPassword(password),
    isBolipassActive,
    bolipassExpiresAt: isBolipassActive ? bolipassExpiresAt : null,
  });

  revalidatePath("/admin/users");
}

/** Admin can only grant visitor/host from the UI — admin itself is never assignable here. */
export async function updateUserRole(formData: FormData) {
  await requireAdminAction();
  const userId = formString(formData, "userId");
  const role = formString(formData, "role");
  if (!userId || (role !== "visitor" && role !== "host")) {
    throw new Error("Invalid role update request");
  }

  const { env } = cf();
  const db = createDb(env.DB);
  await db.update(users).set({ role }).where(eq(users.id, userId));

  revalidatePath("/admin/users");
}

export async function setUserVip(formData: FormData) {
  await requireAdminAction();
  const userId = formString(formData, "userId");
  if (!userId) throw new Error("Missing userId");

  const isBolipassActive = formData.get("isBolipassActive") === "on";
  const bolipassExpiresAt = normalizeDate(formOptionalString(formData, "bolipassExpiresAt"));

  const { env } = cf();
  const db = createDb(env.DB);
  await db
    .update(users)
    .set({ isBolipassActive, bolipassExpiresAt: isBolipassActive ? bolipassExpiresAt : null })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
}
