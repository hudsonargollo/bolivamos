import { NextResponse } from "next/server";
import { registerPushTokenRequestSchema, userPushTokenKey } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = registerPushTokenRequestSchema.parse(await request.json());

    const { env } = cf();
    await env.BOLIVAMOS_KV.put(userPushTokenKey(session.userId), body.expoPushToken);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
