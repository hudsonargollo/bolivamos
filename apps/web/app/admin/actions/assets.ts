"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cf } from "@/lib/cloudflare";
import { requireAdminAction, formOptionalString, formString } from "./require-admin";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["brand", "events", "payment", "documents", "misc"]);
const ALLOWED_TYPES = new Set([
  "image/webp",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "application/pdf",
]);

function slugFileName(name: string) {
  const trimmed = name.trim().toLowerCase();
  const dot = trimmed.lastIndexOf(".");
  const base = dot > 0 ? trimmed.slice(0, dot) : trimmed;
  const ext = dot > 0 ? trimmed.slice(dot + 1) : "";
  const safeBase = base.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "asset";
  const safeExt = ext.replace(/[^a-z0-9]+/g, "");
  return safeExt ? `${safeBase}.${safeExt}` : safeBase;
}

function contentTypeFor(file: File, filename: string) {
  if (file.type && ALLOWED_TYPES.has(file.type)) return file.type;
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  if (filename.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

export async function uploadAdminAsset(formData: FormData) {
  const session = await requireAdminAction();
  const folder = formString(formData, "folder") || "misc";
  if (!ALLOWED_FOLDERS.has(folder)) throw new Error("Invalid asset folder");

  const value = formData.get("asset");
  if (!(value instanceof File) || value.size === 0) throw new Error("Choose a file to upload");
  if (value.size > MAX_UPLOAD_BYTES) throw new Error("File is larger than 10 MB");

  const requestedName = formOptionalString(formData, "filename");
  const originalName = value.name || "asset";
  const filename = slugFileName(requestedName || originalName);
  const contentType = contentTypeFor(value, filename);
  if (!ALLOWED_TYPES.has(contentType)) throw new Error("Unsupported file type");

  const shouldReplace = formData.get("replace") === "on";
  const key = shouldReplace ? `${folder}/${filename}` : `${folder}/${crypto.randomUUID()}-${filename}`;
  const { env } = cf();
  const bytes = await value.arrayBuffer();

  await env.EVENT_ASSETS.put(key, bytes, {
    httpMetadata: { contentType },
    customMetadata: {
      originalName: originalName.slice(0, 120),
      uploadedBy: session.email ?? session.userId,
      uploadedAt: new Date().toISOString(),
    },
  });

  revalidatePath("/admin/assets");
  redirect(`/admin/assets?uploaded=${encodeURIComponent(`/api/assets/${key}`)}`);
}
