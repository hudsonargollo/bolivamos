"use server";

import { eq } from "@bolivibes/db";
import { createDb, venues } from "@bolivibes/db";
import { categorySchema, venueTierSchema } from "@bolivibes/api-schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString, formOptionalString, formOptionalNumber } from "./require-admin";

export async function createVenue(formData: FormData) {
  await requireAdminAction();

  const name = formString(formData, "name");
  const category = categorySchema.parse(formString(formData, "category"));
  if (!name) throw new Error("Name is required");

  const { env } = cf();
  const db = createDb(env.DB);
  const id = crypto.randomUUID();

  await db.insert(venues).values({
    id,
    hostId: formOptionalString(formData, "hostId") ?? null,
    name,
    category,
    address: formOptionalString(formData, "address") ?? null,
    latitude: formOptionalNumber(formData, "latitude") ?? null,
    longitude: formOptionalNumber(formData, "longitude") ?? null,
    tier: venueTierSchema.parse(formString(formData, "tier") || "free"),
    featured: formData.get("featured") === "on",
    // Placeholder secret, same as the host-facing POST /api/venues — regenerate
    // via a real HMAC key once QR issuance is wired up for real.
    qrSecretHash: crypto.randomUUID(),
  });

  revalidatePath("/admin/venues");
  redirect("/admin/venues");
}

export async function updateVenue(formData: FormData) {
  await requireAdminAction();

  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const category = categorySchema.parse(formString(formData, "category"));
  if (!id || !name) throw new Error("Missing required fields");

  const { env } = cf();
  const db = createDb(env.DB);
  await db
    .update(venues)
    .set({
      name,
      category,
      hostId: formOptionalString(formData, "hostId") ?? null,
      address: formOptionalString(formData, "address") ?? null,
      latitude: formOptionalNumber(formData, "latitude") ?? null,
      longitude: formOptionalNumber(formData, "longitude") ?? null,
      tier: venueTierSchema.parse(formString(formData, "tier") || "free"),
      featured: formData.get("featured") === "on",
    })
    .where(eq(venues.id, id));

  revalidatePath("/admin/venues");
  redirect("/admin/venues");
}

export async function deleteVenue(formData: FormData) {
  await requireAdminAction();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing id");

  const { env } = cf();
  const db = createDb(env.DB);
  await db.delete(venues).where(eq(venues.id, id));

  revalidatePath("/admin/venues");
  redirect("/admin/venues");
}
