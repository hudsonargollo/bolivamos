import { NextResponse } from "next/server";
import { sessionKey } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { getCurrentSession, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession(request);
  const { env } = cf();

  if (session) {
    await env.BOLIVAMOS_KV.delete(sessionKey(session.token));
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
