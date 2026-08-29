"use server";

import { eq } from "drizzle-orm";
import { createDb, users, pushCampaigns } from "@bolivamos/db";
import { userPushTokenKey } from "@bolivamos/api-schema";
import { sendExpoPushNotifications, type ExpoPushMessage } from "@bolivamos/notifications";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formString } from "./require-admin";

/**
 * Broadcast-to-a-segment, not geofenced/proximity targeting — no location
 * data is collected from users today (see
 * packages/notifications/src/push/geofence-alerts.ts).
 */
export async function sendPushCampaign(formData: FormData) {
  const session = await requireAdminAction();

  const title = formString(formData, "title");
  const body = formString(formData, "body");
  const target = formString(formData, "target") || "all";
  if (!title || !body) throw new Error("Title and body are required");
  if (target !== "all" && target !== "vip" && target !== "host") throw new Error("Invalid target");

  const { env } = cf();
  const db = createDb(env.DB);

  const allUsers = await db.select().from(users);
  const targetUsers = allUsers.filter((u) => {
    if (target === "vip") return Boolean(u.isBolipassActive);
    if (target === "host") return u.role === "host";
    return true;
  });

  const messages: ExpoPushMessage[] = [];
  for (const user of targetUsers) {
    const token = await env.BOLIVAMOS_KV.get(userPushTokenKey(user.id));
    if (token) messages.push({ to: token, title, body });
  }

  const id = crypto.randomUUID();
  await db.insert(pushCampaigns).values({ id, title, body, target, createdBy: session.userId });

  if (messages.length > 0) {
    await sendExpoPushNotifications(messages);
  }

  await db
    .update(pushCampaigns)
    .set({ sentAt: new Date().toISOString(), recipientCount: messages.length })
    .where(eq(pushCampaigns.id, id));

  revalidatePath("/admin/push");
  redirect("/admin/push");
}
