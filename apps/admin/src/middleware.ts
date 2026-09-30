import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const DEFAULT_SECRET = "eventqr_super_secure_key_2026_production_safe_string_32";
const RAW_JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const JWT_SECRET = new TextEncoder().encode(RAW_JWT_SECRET);

const SUPER_ADMIN_URL =
  process.env.NEXT_PUBLIC_SUPER_ADMIN_URL ||
  "https://eventqr-live-super-admin.vercel.app";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Static files, Next.js assets, aur API routes allow karein
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. /login page par loop na bane
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Read token from query, eventqr_session, or admin_token
  const tokenFromQuery = searchParams.get("token");
  const sessionCookie =
    req.cookies.get("eventqr_session")?.value ||
    req.cookies.get("admin_token")?.value;

  const token = tokenFromQuery || sessionCookie;

  const redirectToLogin = (reason?: string) => {
    const loginUrl = new URL("/login", req.url);
    if (reason) loginUrl.searchParams.set("error", reason);

    const res = NextResponse.redirect(loginUrl);
    res.cookies.set("eventqr_session", "", { path: "/", maxAge: 0 });
    res.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("eventqr_session_role", "", { path: "/", maxAge: 0 });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  };

  // Root path check
  if (pathname === "/") {
    if (!token) return redirectToLogin();
  }

  if (!token) {
    return redirectToLogin("unauthorized");
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = String(payload.role || "").toUpperCase();

    // Super Admin external portal redirect
    if (userRole === "SUPER_ADMIN" && pathname.startsWith("/events")) {
      // If external super admin app is configured, redirect there, else allow
      if (process.env.NEXT_PUBLIC_SUPER_ADMIN_URL) {
        return NextResponse.redirect(new URL(SUPER_ADMIN_URL));
      }
    }

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (err) {
    return redirectToLogin("invalid_session");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
