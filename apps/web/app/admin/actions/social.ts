"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { createZernioPost, getZernioConnectUrl, ZERNIO_PLATFORMS } from "@/lib/zernio";
import { formOptionalString, formString, requireAdminAction } from "./require-admin";

const PLATFORM_VALUES = new Set(ZERNIO_PLATFORMS.map((platform) => platform.value));

function getZernioApiKey(): string {
  const { env } = cf();
  if (!env.ZERNIO_API_KEY) throw new Error("ZERNIO_API_KEY is not configured.");
  return env.ZERNIO_API_KEY;
}

function parseAccountTargets(formData: FormData) {
  return formData
    .getAll("account")
    .map((value) => (typeof value === "string" ? value : ""))
    .filter(Boolean)
    .map((value) => {
      const [platform, accountId] = value.split("|");
      if (!platform || !accountId || !PLATFORM_VALUES.has(platform as (typeof ZERNIO_PLATFORMS)[number]["value"])) {
        throw new Error("Invalid social account target.");
      }
      return { platform, accountId };
    });
}

function parseMediaUrls(formData: FormData) {
  const raw = formOptionalString(formData, "mediaUrls");
  if (!raw) return undefined;
  const mediaItems = raw
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") throw new Error("Media URLs must use HTTPS.");
        return { url: parsed.toString() };
      } catch {
        throw new Error(`Invalid media URL: ${url}`);
      }
    });
  return mediaItems.length ? mediaItems : undefined;
}

function localDatetimeToIso(value: string, timezone: string) {
  if (!value) return undefined;
  if (/[zZ]|[+-]\d\d:?\d\d$/.test(value)) return value;
  const offset = timezone === "America/La_Paz" ? "-04:00" : "";
  return `${value}:00${offset}`;
}

export async function connectZernioAccount(formData: FormData) {
  await requireAdminAction();
  const platform = formString(formData, "platform");
  const profileId = formString(formData, "profileId");
  if (!PLATFORM_VALUES.has(platform as (typeof ZERNIO_PLATFORMS)[number]["value"])) throw new Error("Invalid platform.");
  if (!profileId) throw new Error("Profile is required.");

  const redirectUrl = "https://bolivibes.clubemkt.digital/admin/social";
  const authUrl = await getZernioConnectUrl(getZernioApiKey(), platform, profileId, redirectUrl);
  redirect(authUrl);
}

export async function publishZernioPost(formData: FormData) {
  await requireAdminAction();
  const content = formString(formData, "content");
  const mode = formString(formData, "mode") || "publishNow";
  const timezone = formString(formData, "timezone") || "America/La_Paz";
  const platforms = parseAccountTargets(formData);
  const mediaItems = parseMediaUrls(formData);

  if (!content && !mediaItems?.length) throw new Error("Post content or media is required.");
  if (platforms.length === 0) throw new Error("Select at least one social account.");
  if (mode !== "publishNow" && mode !== "schedule") throw new Error("Invalid publish mode.");

  const scheduledFor = mode === "schedule" ? localDatetimeToIso(formString(formData, "scheduledFor"), timezone) : undefined;
  if (mode === "schedule" && !scheduledFor) throw new Error("Scheduled date/time is required.");

  await createZernioPost(getZernioApiKey(), {
    content,
    platforms,
    publishNow: mode === "publishNow",
    scheduledFor,
    timezone,
    mediaItems,
  });

  revalidatePath("/admin/social");
  redirect("/admin/social?posted=1");
}
