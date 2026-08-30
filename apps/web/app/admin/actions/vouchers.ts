"use server";

import { eq } from "@bolivamos/db";
import { createDb, vouchers } from "@bolivamos/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString, formOptionalString } from "./require-admin";

export async function createVoucher(formData: FormData) {
  await requireAdminAction();

  const venueId = formString(formData, "venueId");
  const title = formString(formData, "title");
  if (!venueId || !title) throw new Error("Venue and title are required");

  const { env } = cf();
  const db = createDb(env.DB);
  const id = crypto.randomUUID();

  await db.insert(vouchers).values({
    id,
    venueId,
    title,
    discountType: formOptionalString(formData, "discountType") ?? "2_FOR_1",
    termsConditions: formOptionalString(formData, "termsConditions") ?? null,
    isActive: formData.get("isActive") === "on",
  });

  revalidatePath("/admin/vouchers");
  redirect("/admin/vouchers");
}

export async function updateVoucher(formData: FormData) {
  await requireAdminAction();

  const id = formString(formData, "id");
  const venueId = formString(formData, "venueId");
  const title = formString(formData, "title");
  if (!id || !venueId || !title) throw new Error("Missing required fields");

  const { env } = cf();
  const db = createDb(env.DB);
  await db
    .update(vouchers)
    .set({
      venueId,
      title,
      discountType: formOptionalString(formData, "discountType") ?? "2_FOR_1",
      termsConditions: formOptionalString(formData, "termsConditions") ?? null,
      isActive: formData.get("isActive") === "on",
    })
    .where(eq(vouchers.id, id));

  revalidatePath("/admin/vouchers");
  redirect("/admin/vouchers");
}

/**
 * Quick active/inactive toggle from the list page — no redirect, stays on
 * /admin/vouchers. Takes the target state explicitly (as "true"/"false")
 * rather than a checkbox, since the toggle is a single submit button per row.
 */
export async function setVoucherActive(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");
  const isActive = formString(formData, "isActive") === "true";

  const { env } = cf();
  const db = createDb(env.DB);
  await db.update(vouchers).set({ isActive }).where(eq(vouchers.id, id));

  revalidatePath("/admin/vouchers");
}

export async function deleteVoucher(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.delete(vouchers).where(eq(vouchers.id, id));

  revalidatePath("/admin/vouchers");
  redirect("/admin/vouchers");
}
