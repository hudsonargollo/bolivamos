/**
 * Standard event banner size — a wide, short ratio that matches how the
 * image actually renders everywhere it's used (the mobile Feed card, the
 * web event flyer section): 2.5:1, cropped to fill rather than letterboxed,
 * so a source image of any size or aspect ratio (a phone photo, a full A4
 * flyer, a square Instagram post, ...) always produces the same shape.
 */
const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 480;
const WEBP_QUALITY = 80;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024; // the Images binding's own input limit

/**
 * Fetches whatever image URL an admin pasted in, then runs it through the
 * Workers Images binding (env.IMAGES) to center-crop and resize it to the
 * standard banner shape and re-encode it as webp. Returns null (never
 * throws) on anything unexpected — a slow/unreachable source, an
 * unsupported format, a file over the binding's 20MB input limit — so a
 * bad image never blocks creating or editing an event; the caller falls
 * back to storing the original pasted URL unchanged.
 */
export async function normalizeEventBanner(
  env: CloudflareEnv,
  sourceUrl: string,
): Promise<Uint8Array | null> {
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok || !res.body) return null;

    const contentLength = res.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_SOURCE_BYTES) return null;

    const result = await env.IMAGES.input(res.body)
      .transform({ width: BANNER_WIDTH, height: BANNER_HEIGHT, fit: "cover" })
      .output({ format: "image/webp", quality: WEBP_QUALITY });

    return new Uint8Array(await new Response(result.image()).arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * A fresh random key per processed image, never reused — pairs with
 * immutable caching on the serving route (app/api/assets/events/[key]) so
 * editing an event's banner later can't ever serve a stale cached copy of
 * the old one under the same URL.
 */
export function eventBannerKey(): string {
  return `${crypto.randomUUID()}.webp`;
}
