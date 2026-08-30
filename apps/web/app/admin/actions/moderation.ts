"use server";

import { eq } from "@bolivamos/db";
import { createDb, userReports, users } from "@bolivamos/db";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString } from "./require-admin";

export async function dismissReport(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.update(userReports).set({ status: "dismissed" }).where(eq(userReports.id, id));

  revalidatePath("/admin/moderation");
}

/** Bans the reported user (session stops resolving — see lib/session.ts) and marks the report reviewed. */
export async function banReportedUser(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  const reportedId = formString(formData, "reportedId");
  if (!id || !reportedId) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.update(users).set({ isBanned: true }).where(eq(users.id, reportedId));
  await db.update(userReports).set({ status: "reviewed" }).where(eq(userReports.id, id));

  revalidatePath("/admin/moderation");
}
