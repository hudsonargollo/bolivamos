import { NextResponse } from "next/server";
import { createDb, users } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import type { AuthUser } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const { env } = cf();
    const db = createDb(env.DB);
    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const dto: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: (user.role ?? "visitor") as AuthUser["role"],
      isBoliPassActive: Boolean(user.isBolipassActive),
    };
    return NextResponse.json(dto);
  } catch (err) {
    return toErrorResponse(err);
  }
}
