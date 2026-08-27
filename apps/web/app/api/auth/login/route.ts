import { NextResponse } from "next/server";
import { passwordLoginRequestSchema, type AuthResponse } from "@bolivamos/api-schema";
import { verifyUserPassword } from "@/lib/password-auth";
import { issueSessionForUser } from "@/lib/issue-session";
import { SESSION_COOKIE_NAME } from "@/lib/session";

/** Email+password login, alongside Google OAuth (apps/web/lib/issue-session.ts). */
export async function POST(request: Request) {
  const body = passwordLoginRequestSchema.parse(await request.json());

  const user = await verifyUserPassword(body.email, body.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { token } = await issueSessionForUser({
    email: user.email,
    fullName: user.fullName,
    role: (user.role ?? "visitor") as AuthResponse["user"]["role"],
  });

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
