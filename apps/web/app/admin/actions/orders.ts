"use server";

import { eq } from "@bolivamos/db";
import { createDb, orders } from "@bolivamos/db";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString } from "./require-admin";

/**
 * Manual confirm for the QR Bolivia/QR PIX/crypto rails, once an admin has
 * verified the payment actually landed externally — mirrors
 * app/api/subscriptions/bolipass/route.ts's "just flip the flag" precedent.
 * Stripe orders confirm themselves via the webhook instead.
 */
export async function confirmOrder(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.update(orders).set({ status: "paid" }).where(eq(orders.id, id));

  revalidatePath("/admin/orders");
}

export async function cancelOrder(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, id));

  revalidatePath("/admin/orders");
}
