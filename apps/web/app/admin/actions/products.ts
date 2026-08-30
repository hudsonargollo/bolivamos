"use server";

import { eq } from "@bolivamos/db";
import { createDb, products } from "@bolivamos/db";
import { productTypeSchema } from "@bolivamos/api-schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString, formOptionalString, formOptionalNumber } from "./require-admin";

export async function createProduct(formData: FormData) {
  await requireAdminAction();

  const type = productTypeSchema.parse(formString(formData, "type"));
  const title = formString(formData, "title");
  const priceBob = formOptionalNumber(formData, "priceBob");
  if (!title || priceBob === undefined) throw new Error("Title and price (BOB) are required");

  const { env } = cf();
  const db = createDb(env.DB);
  const id = crypto.randomUUID();

  await db.insert(products).values({
    id,
    type,
    eventId: formOptionalString(formData, "eventId") ?? null,
    title,
    description: formOptionalString(formData, "description") ?? null,
    priceBob,
    priceUsd: formOptionalNumber(formData, "priceUsd") ?? null,
    audioUrl: formOptionalString(formData, "audioUrl") ?? null,
    capacity: formOptionalNumber(formData, "capacity") ?? null,
    active: formData.get("active") === "on",
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  await requireAdminAction();

  const id = formString(formData, "id");
  const type = productTypeSchema.parse(formString(formData, "type"));
  const title = formString(formData, "title");
  const priceBob = formOptionalNumber(formData, "priceBob");
  if (!id || !title || priceBob === undefined) throw new Error("Missing required fields");

  const { env } = cf();
  const db = createDb(env.DB);
  await db
    .update(products)
    .set({
      type,
      eventId: formOptionalString(formData, "eventId") ?? null,
      title,
      description: formOptionalString(formData, "description") ?? null,
      priceBob,
      priceUsd: formOptionalNumber(formData, "priceUsd") ?? null,
      audioUrl: formOptionalString(formData, "audioUrl") ?? null,
      capacity: formOptionalNumber(formData, "capacity") ?? null,
      active: formData.get("active") === "on",
    })
    .where(eq(products.id, id));

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.delete(products).where(eq(products.id, id));

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
