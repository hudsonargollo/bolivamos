import { NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { mobileGoogleLoginRequestSchema, type AuthResponse } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { issueSessionForUser } from "@/lib/issue-session";

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const googleJwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

/**
 * Mobile Google Sign-In (PRD 3.2). The Expo app obtains a Google `id_token`
 * client-side via expo-auth-session, then POSTs it here for server-side
 * verification — the mobile app never talks to Google's token endpoint with
 * a client secret.
 */
export async function POST(request: Request) {
  const { env } = cf();
  const body = mobileGoogleLoginRequestSchema.parse(await request.json());

  const { payload } = await jwtVerify(body.idToken, googleJwks, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: [env.GOOGLE_WEB_CLIENT_ID, env.GOOGLE_IOS_CLIENT_ID, env.GOOGLE_ANDROID_CLIENT_ID].filter(
      Boolean,
    ),
  });

  const email = payload.email as string | undefined;
  if (!email) {
    return NextResponse.json({ error: "Google token missing email claim" }, { status: 400 });
  }

  const { token, user } = await issueSessionForUser({
    email,
    fullName: (payload.name as string | undefined) ?? null,
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

  return NextResponse.json(response);
}
