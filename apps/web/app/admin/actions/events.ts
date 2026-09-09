"use server";

import { eq } from "@bolivamos/db";
import { createDb, events } from "@bolivamos/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { normalizeEventBanner, eventBannerKey } from "@/lib/event-image";
import { requireAdminAction, formString, formOptionalString, formOptionalNumber } from "./require-admin";

/**
 * Re-processes whatever image URL an admin pasted in (any size or format)
 * into a standard-shaped banner stored in R2, returning the URL to save on
 * the event. Falls back to the original pasted URL unchanged if fetching
 * or decoding it fails, so a bad/unreachable image never blocks saving —
 * it just doesn't get the improved crop.
 */
async function resolveBannerUrl(
  env: CloudflareEnv,
  imageUrl: string | null,
): Promise<string | null> {
  if (!imageUrl) return null;

  const processed = await normalizeEventBanner(env, imageUrl);
  if (!processed) return imageUrl;

  const key = eventBannerKey();
  await env.EVENT_ASSETS.put(key, processed, { httpMetadata: { contentType: "image/webp" } });
  return `/api/assets/events/${key}`;
}

export async function createEvent(formData: FormData) {
  await requireAdminAction();

  const title = formString(formData, "title");
  const startTime = formString(formData, "startTime");
  if (!title || !startTime) throw new Error("Title and start time are required");

  const { env } = cf();
  const db = createDb(env.DB);
  const id = crypto.randomUUID();
  const imageUrl = await resolveBannerUrl(env, formOptionalString(formData, "imageUrl") ?? null);

  await db.insert(events).values({
    id,
    venueId: formOptionalString(formData, "venueId") ?? null,
    title,
    description: formOptionalString(formData, "description") ?? null,
    startTime,
    endTime: formOptionalString(formData, "endTime") ?? null,
    imageUrl,
    category: formOptionalString(formData, "category") ?? null,
    priceText: formOptionalString(formData, "priceText") ?? null,
    isFree: formData.get("isFree") === "on",
    venueName: formOptionalString(formData, "venueName") ?? null,
    district: formOptionalString(formData, "district") ?? null,
    mapsUrl: formOptionalString(formData, "mapsUrl") ?? null,
    lat: formOptionalNumber(formData, "lat") ?? null,
    lng: formOptionalNumber(formData, "lng") ?? null,
    isVipOnly: formData.get("isVipOnly") === "on",
    featured: formData.get("featured") === "on",
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
  // Re-processes on every save, even when the pasted URL is unchanged from
  // last time (which, once processed, is our own /api/assets/events/... URL)
  // — simple and always correct, at the cost of a redundant re-encode and an
  // orphaned R2 object on saves that don't actually touch the image.
  const imageUrl = await resolveBannerUrl(env, formOptionalString(formData, "imageUrl") ?? null);
  await db
    .update(events)
    .set({
      venueId: formOptionalString(formData, "venueId") ?? null,
      title,
      description: formOptionalString(formData, "description") ?? null,
      startTime,
      endTime: formOptionalString(formData, "endTime") ?? null,
      imageUrl,
      category: formOptionalString(formData, "category") ?? null,
      priceText: formOptionalString(formData, "priceText") ?? null,
      isFree: formData.get("isFree") === "on",
      venueName: formOptionalString(formData, "venueName") ?? null,
      district: formOptionalString(formData, "district") ?? null,
      mapsUrl: formOptionalString(formData, "mapsUrl") ?? null,
      lat: formOptionalNumber(formData, "lat") ?? null,
      lng: formOptionalNumber(formData, "lng") ?? null,
      isVipOnly: formData.get("isVipOnly") === "on",
      featured: formData.get("featured") === "on",
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
