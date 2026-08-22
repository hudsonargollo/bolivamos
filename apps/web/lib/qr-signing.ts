/**
 * Signs/verifies a venue's static, printable QR payload (PRD 4.2/4.4).
 * `sig` = hex HMAC-SHA256(venue.qr_secret_hash, venueId).
 */

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signVenueQr(venueId: string, qrSecretHash: string): Promise<string> {
  return hmacHex(qrSecretHash, venueId);
}

export async function verifyVenueQr(
  venueId: string,
  sig: string,
  qrSecretHash: string,
): Promise<boolean> {
  const expected = await hmacHex(qrSecretHash, venueId);
  if (expected.length !== sig.length) return false;
  // Constant-time-ish comparison to avoid trivial timing side-channels.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}
