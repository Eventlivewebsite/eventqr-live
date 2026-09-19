import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Static chunks, assets, and APIs bypass
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Token Extraction
  const tokenFromQuery = searchParams.get("token");
  const tokenFromCookie =
    req.cookies.get("client_token")?.value ||
    req.cookies.get("admin_token")?.value ||
    req.cookies.get("eventqr_session")?.value;

  const token = tokenFromQuery || tokenFromCookie;
  const hasValidToken = Boolean(token && token.trim().length > 10);

  // 3. Login Page Logic
  if (pathname === "/login") {
    if (hasValidToken) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 4. Protected Routes Check
  const isProtectedPath =
    pathname.startsWith("/events") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/gallery") ||
    pathname.startsWith("/clients") ||
    pathname === "/";

  if (isProtectedPath && !hasValidToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "unauthorized");
    loginUrl.searchParams.set("redirect", pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("client_token");
    response.cookies.delete("admin_token");
    response.cookies.delete("eventqr_session");
    return response;
  }

  // 5. Query token handshake
  if (tokenFromQuery) {
    const isProduction = process.env.NODE_ENV === "production";
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete("token");

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set("client_token", tokenFromQuery, {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};