import { NextResponse } from "next/server";
import { createDb, vouchers } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import {
  createVoucherRequestSchema,
  type VoucherDto,
  type LockedVoucherTeaser,
} from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { getCurrentSession, requireRole } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

// Placeholder — the schema has no menu/ticket price, so a real "you'd save
// X BOB" figure needs product input on where price data comes from.
const PLACEHOLDER_ESTIMATED_SAVINGS_BOB = 50;

function toVoucherDto(voucher: typeof vouchers.$inferSelect): VoucherDto {
  return {
    id: voucher.id,
    venueId: voucher.venueId,
    title: voucher.title,
    discountType: voucher.discountType,
    termsConditions: voucher.termsConditions,
    isActive: voucher.isActive,
  };
}

/** Non-subscribers see locked teasers with an estimated-savings counter (PRD 4.2 freemium teaser). */
export async function GET(request: Request) {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(vouchers).where(eq(vouchers.isActive, true));

  const session = await getCurrentSession(request);
  if (session?.isBoliPass) {
    return NextResponse.json(rows.map(toVoucherDto) satisfies VoucherDto[]);
  }

  const teasers: LockedVoucherTeaser[] = rows.map((v) => ({
    voucher: toVoucherDto(v),
    estimatedSavingsBob: PLACEHOLDER_ESTIMATED_SAVINGS_BOB,
    locked: true,
  }));
  return NextResponse.json(teasers);
}

/** Host-only: create a voucher for one of the host's venues. */
export async function POST(request: Request) {
  try {
    await requireRole(request, "host");
    const body = createVoucherRequestSchema.parse(await request.json());

    const { env } = cf();
    const db = createDb(env.DB);
    const id = crypto.randomUUID();

    await db.insert(vouchers).values({
      id,
      venueId: body.venueId,
      title: body.title,
      discountType: body.discountType,
      termsConditions: body.termsConditions ?? null,
    });

    const [created] = await db.select().from(vouchers).where(eq(vouchers.id, id)).limit(1);
    if (!created) throw new Error("Failed to load created voucher");
    return NextResponse.json(toVoucherDto(created), { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
