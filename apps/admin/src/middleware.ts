import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. ALL API routes, static files, and Next.js internals must bypass immediately
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

  // 2. Token Extraction (Query, Cookies, Authorization)
  const tokenFromQuery = searchParams.get("token");
  const tokenFromCookie =
    req.cookies.get("client_token")?.value ||
    req.cookies.get("admin_token")?.value ||
    req.cookies.get("eventqr_session")?.value;

  const token = tokenFromQuery || tokenFromCookie;

  // 3. Handle Login Page
  if (pathname === "/login") {
    // Agar valid format token present hai toh direct dashboard bhej do
    if (token && token.length > 20) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 4. Protected Routes List
  const isProtectedPath =
    pathname.startsWith("/events") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/";

  // 5. Unauthorized access check
  if (isProtectedPath) {
    if (!token || token.trim().length < 10) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("client_token");
      response.cookies.delete("admin_token");
      response.cookies.delete("eventqr_session");
      response.cookies.delete("eventqr_session_role");
      return response;
    }
  }

  // 6. Agar token query param me aaya tha, toh cookie set karke URL saaf karein
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercept all routes except static assets and files
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};