"use server";

import { eq } from "drizzle-orm";
import { createDb, events } from "@bolivamos/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString, formOptionalString, formOptionalNumber } from "./require-admin";

export async function createEvent(formData: FormData) {
  await requireAdminAction();

  const title = formString(formData, "title");
  const startTime = formString(formData, "startTime");
  if (!title || !startTime) throw new Error("Title and start time are required");

  const { env } = cf();
  const db = createDb(env.DB);
  const id = crypto.randomUUID();

  await db.insert(events).values({
    id,
    venueId: formOptionalString(formData, "venueId") ?? null,
    title,
    description: formOptionalString(formData, "description") ?? null,
    startTime,
    endTime: formOptionalString(formData, "endTime") ?? null,
    imageUrl: formOptionalString(formData, "imageUrl") ?? null,
    category: formOptionalString(formData, "category") ?? null,
    priceText: formOptionalString(formData, "priceText") ?? null,
    isFree: formData.get("isFree") === "on",
    venueName: formOptionalString(formData, "venueName") ?? null,
    district: formOptionalString(formData, "district") ?? null,
    mapsUrl: formOptionalString(formData, "mapsUrl") ?? null,
    lat: formOptionalNumber(formData, "lat") ?? null,
    lng: formOptionalNumber(formData, "lng") ?? null,
  });

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEvent(formData: FormData) {
  await requireAdminAction();

  const id = formString(formData, "id");
  const title = formString(formData, "title");
  const startTime = formString(formData, "startTime");
  if (!id || !title || !startTime) throw new Error("Missing required fields");

  const { env } = cf();
  const db = createDb(env.DB);
  await db
    .update(events)
    .set({
      venueId: formOptionalString(formData, "venueId") ?? null,
      title,
      description: formOptionalString(formData, "description") ?? null,
      startTime,
      endTime: formOptionalString(formData, "endTime") ?? null,
      imageUrl: formOptionalString(formData, "imageUrl") ?? null,
      category: formOptionalString(formData, "category") ?? null,
      priceText: formOptionalString(formData, "priceText") ?? null,
      isFree: formData.get("isFree") === "on",
      venueName: formOptionalString(formData, "venueName") ?? null,
      district: formOptionalString(formData, "district") ?? null,
      mapsUrl: formOptionalString(formData, "mapsUrl") ?? null,
      lat: formOptionalNumber(formData, "lat") ?? null,
      lng: formOptionalNumber(formData, "lng") ?? null,
    })
    .where(eq(events.id, id));

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.delete(events).where(eq(events.id, id));

  revalidatePath("/admin/events");
  redirect("/admin/events");
}
