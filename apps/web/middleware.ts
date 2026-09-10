import { NextResponse, type NextRequest } from "next/server";

const AGREEMENT_PASSWORD = "bolitec";

function unauthorizedAgreementResponse() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="BoliVibes agreement", charset="UTF-8"',
    },
  });
}

function isAgreementAuthorized(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    const password = separator >= 0 ? decoded.slice(separator + 1) : decoded;
    return password === AGREEMENT_PASSWORD;
  } catch {
    return false;
  }
}

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

  if (pathname.startsWith("/agreement")) {
    if (!isAgreementAuthorized(request)) return unauthorizedAgreementResponse();
  }

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
  matcher: ["/agreement/:path*", "/host/:path*", "/admin/:path*", "/santa-cruz-de-la-sierra/:path*"],
};
