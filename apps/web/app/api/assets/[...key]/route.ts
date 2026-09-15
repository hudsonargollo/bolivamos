import { cf } from "@/lib/cloudflare";

function normalizeKey(parts: string[]) {
  const key = parts.join("/");
  if (!key || key.includes("..") || key.startsWith("/") || key.endsWith("/")) return null;
  return key;
}

/** Serves admin-uploaded assets stored in R2 with local fallback. */
export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params;
  const key = normalizeKey(parts);
  if (!key) return new Response("Not found", { status: 404 });

  const { env } = cf();
  const object = await env.EVENT_ASSETS.get(key);
  if (!object) {
    if (key === "brand/logo-clay.webp" || key === "brand/bolivibes-logo.webp") {
      const fallbackUrl = new URL("/imgs/logo-clay.webp", request.url);
      return env.ASSETS.fetch(fallbackUrl.toString());
    }
    if (key === "brand/logo-icon.webp" || key === "brand/bolivibes-icon.webp") {
      const fallbackUrl = new URL("/imgs/logo-icon.webp", request.url);
      return env.ASSETS.fetch(fallbackUrl.toString());
    }
    return new Response("Not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": key.startsWith("brand/") ? "public, max-age=300, stale-while-revalidate=86400" : "public, max-age=31536000, immutable",
      etag: object.httpEtag,
    },
  });
}
