import { NextResponse, type NextRequest } from "next/server";

/**
 * Route-level guard for the Host Portal pages (not the API — those enforce
 * auth themselves via lib/session.ts). Full role verification happens in
 * app/host/layout.tsx (needs KV access, which isn't available in Edge
 * middleware without extra binding wiring); this just fast-fails when there's
 * no session cookie at all.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/host")) {
    const hasSession = request.cookies.has("bv_session");
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/host/:path*"],
};
