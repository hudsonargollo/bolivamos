"use server";

import { eq } from "@bolivibes/db";
import { createDb, users } from "@bolivibes/db";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString, formOptionalString } from "./require-admin";

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
  const bolipassExpiresAt = formOptionalString(formData, "bolipassExpiresAt") ?? null;

  const { env } = cf();
  const db = createDb(env.DB);
  await db
    .update(users)
    .set({ isBolipassActive, bolipassExpiresAt: isBolipassActive ? bolipassExpiresAt : null })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
}
