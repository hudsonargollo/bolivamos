import { NextResponse } from "next/server";
import { updatePreferencesRequestSchema, userPrefsKey } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

export async function PUT(request: Request) {
  try {
    const session = await requireSession(request);
    const body = updatePreferencesRequestSchema.parse(await request.json());

    const { env } = cf();
    await env.BOLIVAMOS_KV.put(userPrefsKey(session.userId), JSON.stringify(body.categories));

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
