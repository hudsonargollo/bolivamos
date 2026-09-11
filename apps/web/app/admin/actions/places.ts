"use server";

import { eq } from "@bolivibes/db";
import { createDb, places } from "@bolivibes/db";
import { placeLayerSchema } from "@bolivibes/api-schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString, formOptionalString, formOptionalNumber } from "./require-admin";

export async function createPlace(formData: FormData) {
  await requireAdminAction();

  const name = formString(formData, "name");
  const layer = placeLayerSchema.parse(formString(formData, "layer"));
  if (!name) throw new Error("Name is required");

  const { env } = cf();
  const db = createDb(env.DB);
  const id = crypto.randomUUID();

  await db.insert(places).values({
    id,
    name,
    layer,
    category: formOptionalString(formData, "category") ?? null,
    district: formOptionalString(formData, "district") ?? null,
    lat: formOptionalNumber(formData, "lat") ?? null,
    lng: formOptionalNumber(formData, "lng") ?? null,
    rating: formOptionalNumber(formData, "rating") ?? null,
    reviews: formOptionalNumber(formData, "reviews") ?? null,
    price: formOptionalString(formData, "price") ?? null,
    description: formOptionalString(formData, "description") ?? null,
    address: formOptionalString(formData, "address") ?? null,
    googleMapsUrl: formOptionalString(formData, "googleMapsUrl") ?? null,
    websiteUrl: formOptionalString(formData, "websiteUrl") ?? null,
    instagramUrl: formOptionalString(formData, "instagramUrl") ?? null,
    tiktokUrl: formOptionalString(formData, "tiktokUrl") ?? null,
    phone: formOptionalString(formData, "phone") ?? null,
    regional: formData.get("regional") === "on",
    venueId: formOptionalString(formData, "venueId") ?? null,
    source: "manual",
    verified: formData.get("verified") === "on",
  });

  revalidatePath("/admin/places");
  redirect("/admin/places");
}

export async function updatePlace(formData: FormData) {
  await requireAdminAction();

  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const layer = placeLayerSchema.parse(formString(formData, "layer"));
  if (!id || !name) throw new Error("Missing required fields");

  const { env } = cf();
  const db = createDb(env.DB);
  await db
    .update(places)
    .set({
      name,
      layer,
      category: formOptionalString(formData, "category") ?? null,
      district: formOptionalString(formData, "district") ?? null,
      lat: formOptionalNumber(formData, "lat") ?? null,
      lng: formOptionalNumber(formData, "lng") ?? null,
      rating: formOptionalNumber(formData, "rating") ?? null,
      reviews: formOptionalNumber(formData, "reviews") ?? null,
      price: formOptionalString(formData, "price") ?? null,
      description: formOptionalString(formData, "description") ?? null,
      address: formOptionalString(formData, "address") ?? null,
      googleMapsUrl: formOptionalString(formData, "googleMapsUrl") ?? null,
      websiteUrl: formOptionalString(formData, "websiteUrl") ?? null,
      phone: formOptionalString(formData, "phone") ?? null,
      regional: formData.get("regional") === "on",
      venueId: formOptionalString(formData, "venueId") ?? null,
      verified: formData.get("verified") === "on",
    })
    .where(eq(places.id, id));

  revalidatePath("/admin/places");
  redirect("/admin/places");
}

/** One-click "approve for the map" from the list page — no redirect. */
export async function verifyPlace(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.update(places).set({ verified: true }).where(eq(places.id, id));

  revalidatePath("/admin/places");
}

export async function deletePlace(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.delete(places).where(eq(places.id, id));

  revalidatePath("/admin/places");
  redirect("/admin/places");
}
