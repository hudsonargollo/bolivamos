import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { createDb, venues, vouchers, redemptions } from "@bolivamos/db";
import {
  redeemVoucherRequestSchema,
  redemptionLockKey,
  redemptionLockValueSchema,
  REDEMPTION_LOCK_TTL_SECONDS,
  type RedeemVoucherResponse,
} from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";
import { verifyVenueQr } from "@/lib/qr-signing";

/**
 * Redeems a BoliPass voucher (PRD 4.2 QR redemption flow):
 * scan static venue QR -> verify HMAC -> check/set 24h KV lock -> write D1 row.
 */
export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    if (!session.isBoliPass) {
      throw new SessionError(403, "BoliPass subscription required to redeem vouchers");
    }

    const body = redeemVoucherRequestSchema.parse(await request.json());
    const { env } = cf();
    const db = createDb(env.DB);

    const [venue] = await db
      .select()
      .from(venues)
      .where(eq(venues.id, body.qrPayload.venueId))
      .limit(1);
    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

    const validSignature = await verifyVenueQr(venue.id, body.qrPayload.sig, venue.qrSecretHash);
    if (!validSignature) {
      return NextResponse.json({ error: "Invalid or tampered QR code" }, { status: 400 });
    }

    const [voucher] = await db
      .select()
      .from(vouchers)
      .where(and(eq(vouchers.id, body.voucherId), eq(vouchers.venueId, venue.id)))
      .limit(1);
    if (!voucher || !voucher.isActive) {
      return NextResponse.json({ error: "Voucher not found or inactive at this venue" }, { status: 404 });
    }

    const lockKey = redemptionLockKey(session.userId, body.voucherId);
    const existingLock = await env.BOLIVAMOS_KV.get(lockKey, "json");
    if (existingLock) {
      redemptionLockValueSchema.parse(existingLock); // shape sanity check
      return NextResponse.json({ error: "This voucher was already redeemed recently" }, { status: 409 });
    }
    await env.BOLIVAMOS_KV.put(lockKey, JSON.stringify({ timestamp: Date.now() }), {
      expirationTtl: REDEMPTION_LOCK_TTL_SECONDS,
    });

    const redemptionId = crypto.randomUUID();
    const savedAmountBob = body.savedAmountBob ?? 0;
    await db.insert(redemptions).values({
      id: redemptionId,
      userId: session.userId,
      voucherId: body.voucherId,
      savedAmountBob,
    });

    const [redemption] = await db.select().from(redemptions).where(eq(redemptions.id, redemptionId)).limit(1);
    if (!redemption) throw new Error("Failed to load created redemption");

    const totalSavedRows = await db
      .select({ savedAmountBob: redemptions.savedAmountBob })
      .from(redemptions)
      .where(eq(redemptions.userId, session.userId));
    const totalSavedBob = totalSavedRows.reduce((sum, r) => sum + (r.savedAmountBob ?? 0), 0);

    const response: RedeemVoucherResponse = {
      redemption: {
        id: redemption.id,
        userId: redemption.userId,
        voucherId: redemption.voucherId,
        savedAmountBob: redemption.savedAmountBob,
        redeemedAt: redemption.redeemedAt,
      },
      totalSavedBob,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
