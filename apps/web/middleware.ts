import { NextResponse, type NextRequest } from "next/server";

/**
 * Route-level guard for the Host Portal and Admin Dashboard pages (not the
 * API — those enforce auth themselves via lib/session.ts). Full role
 * verification happens in app/host/layout.tsx and app/admin/layout.tsx
 * (needs KV access, which isn't available in Edge middleware without extra
 * binding wiring); this just fast-fails when there's no session cookie at all.
 *
 * Also rewrites the bilingual public content tree
 * (app/[locale]/santa-cruz-de-la-sierra/...) so Spanish — the default — has
 * no URL prefix while English is explicitly `/en/...`: a bare
 * `/santa-cruz-de-la-sierra/...` request is rewritten to prepend `/es`
 * internally; `/en/santa-cruz-de-la-sierra/...` already matches `[locale]`
 * directly and passes through untouched. Only one middleware file is allowed
 * per app, so this extends the existing guard rather than adding a second one.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/host") || pathname.startsWith("/admin")) {
    const hasSession = request.cookies.has("bv_session");
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/santa-cruz-de-la-sierra")) {
    const url = request.nextUrl.clone();
    url.pathname = `/es${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/host/:path*", "/admin/:path*", "/santa-cruz-de-la-sierra/:path*"],
};
