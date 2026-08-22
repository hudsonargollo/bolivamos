import { NextResponse } from "next/server";
import { createDb, users } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/session";
import { cf } from "@/lib/cloudflare";
import type { AuthUser } from "@bolivamos/api-schema";

export async function GET(request: Request) {
  const session = await getCurrentSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { env } = cf();
  const db = createDb(env.DB);
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const dto: AuthUser = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: (user.role ?? "visitor") as AuthUser["role"],
    isBoliPassActive: Boolean(user.isBolipassActive),
  };
  return NextResponse.json(dto);
}
