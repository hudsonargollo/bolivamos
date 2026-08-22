import { NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { issueSessionForUser } from "@/lib/issue-session";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { OAUTH_STATE_COOKIE } from "@/lib/oauth-state";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export async function GET(request: Request) {
  const { env } = cf();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieHeader = request.headers.get("cookie") ?? "";
  const expectedState = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.split("=")[1];

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_WEB_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Google token exchange failed" }, { status: 502 });
  }

  const { access_token: accessToken } = (await tokenRes.json()) as { access_token: string };

  const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!userInfoRes.ok) {
    return NextResponse.json({ error: "Failed to fetch Google user info" }, { status: 502 });
  }
  const userInfo = (await userInfoRes.json()) as { email: string; name?: string };

  const { token } = await issueSessionForUser({
    email: userInfo.email,
    fullName: userInfo.name ?? null,
    role: "host", // web OAuth flow is the Host Portal login
  });

  const res = NextResponse.redirect(new URL("/host", url.origin));
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.delete(OAUTH_STATE_COOKIE);
  return res;
}
