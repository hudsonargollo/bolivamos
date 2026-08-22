import { NextResponse } from "next/server";
import { devLoginRequestSchema, type AuthResponse } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { issueSessionForUser } from "@/lib/issue-session";
import { SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Local-dev-only mock login (PRD scaffold decision — see plan doc). Lets
 * every protected route be exercised before real Google OAuth client IDs
 * exist. Must never be reachable outside local dev.
 */
export async function POST(request: Request) {
  const { env } = cf();
  if (env.DEV_MODE_MOCK_AUTH !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = devLoginRequestSchema.parse(await request.json().catch(() => ({})));
  const { token, user } = await issueSessionForUser({ email: body.email, role: body.role });

  const response: AuthResponse = {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: (user.role ?? "visitor") as AuthResponse["user"]["role"],
      isBoliPassActive: Boolean(user.isBolipassActive),
    },
  };

  const res = NextResponse.json(response);
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
