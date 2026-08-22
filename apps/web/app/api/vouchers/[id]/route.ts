import { NextResponse } from "next/server";
import { createDb, vouchers } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import type { VoucherDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);
  const [voucher] = await db.select().from(vouchers).where(eq(vouchers.id, id)).limit(1);
  if (!voucher) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dto: VoucherDto = {
    id: voucher.id,
    venueId: voucher.venueId,
    title: voucher.title,
    discountType: voucher.discountType,
    termsConditions: voucher.termsConditions,
    isActive: voucher.isActive,
  };
  return NextResponse.json(dto);
}
