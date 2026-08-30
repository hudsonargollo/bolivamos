"use server";

import { eq } from "@bolivamos/db";
import { createDb, paymentMethods } from "@bolivamos/db";
import { manualPaymentMethodSchema } from "@bolivamos/api-schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString, formOptionalString } from "./require-admin";

export async function createPaymentMethod(formData: FormData) {
  await requireAdminAction();

  const method = manualPaymentMethodSchema.parse(formString(formData, "method"));
  const label = formString(formData, "label");
  if (!label) throw new Error("Label is required");

  const { env } = cf();
  const db = createDb(env.DB);
  const id = crypto.randomUUID();

  await db.insert(paymentMethods).values({
    id,
    method,
    label,
    qrImageUrl: formOptionalString(formData, "qrImageUrl") ?? null,
    addressOrKey: formOptionalString(formData, "addressOrKey") ?? null,
    instructions: formOptionalString(formData, "instructions") ?? null,
    active: formData.get("active") === "on",
  });

  revalidatePath("/admin/payment-methods");
  redirect("/admin/payment-methods");
}

export async function updatePaymentMethod(formData: FormData) {
  await requireAdminAction();

  const id = formString(formData, "id");
  const method = manualPaymentMethodSchema.parse(formString(formData, "method"));
  const label = formString(formData, "label");
  if (!id || !label) throw new Error("Missing required fields");

  const { env } = cf();
  const db = createDb(env.DB);
  await db
    .update(paymentMethods)
    .set({
      method,
      label,
      qrImageUrl: formOptionalString(formData, "qrImageUrl") ?? null,
      addressOrKey: formOptionalString(formData, "addressOrKey") ?? null,
      instructions: formOptionalString(formData, "instructions") ?? null,
      active: formData.get("active") === "on",
    })
    .where(eq(paymentMethods.id, id));

  revalidatePath("/admin/payment-methods");
  redirect("/admin/payment-methods");
}

export async function deletePaymentMethod(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.delete(paymentMethods).where(eq(paymentMethods.id, id));

  revalidatePath("/admin/payment-methods");
  redirect("/admin/payment-methods");
}
