"use server";

import { eq } from "@bolivamos/db";
import { createDb, appSettings } from "@bolivamos/db";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString } from "./require-admin";
import { BOLIPASS_PRICE_KEY } from "./settings-constants";

export async function setBolipassPrice(formData: FormData) {
  await requireAdminAction();
  const price = formString(formData, "priceBob");
  if (!price || Number.isNaN(Number(price))) throw new Error("Enter a valid price");

  const { env } = cf();
  const db = createDb(env.DB);

  const [existing] = await db.select().from(appSettings).where(eq(appSettings.key, BOLIPASS_PRICE_KEY)).limit(1);
  if (existing) {
    await db.update(appSettings).set({ value: price }).where(eq(appSettings.key, BOLIPASS_PRICE_KEY));
  } else {
    await db.insert(appSettings).values({ key: BOLIPASS_PRICE_KEY, value: price });
  }

  revalidatePath("/admin/analytics");
}
