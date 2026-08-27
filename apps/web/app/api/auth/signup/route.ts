import { NextResponse } from "next/server";
import { passwordSignupRequestSchema, type AuthResponse } from "@bolivamos/api-schema";
import { createUserWithPassword, EmailAlreadyRegisteredError } from "@/lib/password-auth";
import { issueSessionForUser } from "@/lib/issue-session";
import { SESSION_COOKIE_NAME } from "@/lib/session";

/** Email+password signup, alongside Google OAuth (apps/web/lib/issue-session.ts). */
export async function POST(request: Request) {
  const body = passwordSignupRequestSchema.parse(await request.json());

  try {
    await createUserWithPassword(body);
  } catch (err) {
    if (err instanceof EmailAlreadyRegisteredError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }

  const { token, user } = await issueSessionForUser({
    email: body.email,
    fullName: body.fullName ?? null,
    role: body.role,
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
