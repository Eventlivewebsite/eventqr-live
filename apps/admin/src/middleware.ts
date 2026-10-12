import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const DEFAULT_SECRET = "eventqr_super_secure_key_2026_production_safe_string_32";
const RAW_JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const JWT_SECRET = new TextEncoder().encode(RAW_JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Static assets, API routes, aur public files bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie =
    req.cookies.get("eventqr_session")?.value ||
    req.cookies.get("admin_token")?.value;

  // 2. Agar login page par hai
  if (pathname === "/login") {
    // Agar already logged in hai to dashboard/events bhej do
    if (sessionCookie) {
      try {
        await jwtVerify(sessionCookie, JWT_SECRET);
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch {
        // Invalid cookie hai to clear karo aur login par rehne do
        const res = NextResponse.next();
        res.cookies.delete("eventqr_session");
        res.cookies.delete("admin_token");
        return res;
      }
    }
    return NextResponse.next();
  }

  // 3. Protected routes ke liye check
  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(sessionCookie, JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    // JWT verification failed
    const loginUrl = new URL("/login", req.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("eventqr_session");
    res.cookies.delete("admin_token");
    res.cookies.delete("eventqr_session_role");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
