import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const RAW_JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(
  RAW_JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

const SUPER_ADMIN_URL =
  process.env.NEXT_PUBLIC_SUPER_ADMIN_URL ||
  "https://eventqr-live-super-admin.vercel.app";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Static files, assets, API routes ko sidha allow karein
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

  // 2. CRITICAL: /login page par KABHI loop mat banne do
  // Chahe cookie ho ya na ho, /login page hamesha cleanly khulna chahiye
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const tokenFromQuery = searchParams.get("token");
  const sessionCookie = req.cookies.get("eventqr_session")?.value;
  const token = tokenFromQuery || sessionCookie;

  const redirectToLogin = (reason?: string) => {
    const loginUrl = new URL("/login", req.url);
    if (reason) loginUrl.searchParams.set("error", reason);

    const res = NextResponse.redirect(loginUrl);
    // Loop todne ke liye saari corrupt cookies turant kill karein
    res.cookies.set("eventqr_session", "", { path: "/", maxAge: 0, expires: new Date(0) });
    res.cookies.set("eventqr_session_role", "", { path: "/", maxAge: 0, expires: new Date(0) });
    res.cookies.set("admin_token", "", { path: "/", maxAge: 0, expires: new Date(0) });
    res.cookies.set("client_token", "", { path: "/", maxAge: 0, expires: new Date(0) });
    res.cookies.set("super_admin_session", "", { path: "/", maxAge: 0, expires: new Date(0) });

    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  };

  // 3. Root route (/) handling
  if (pathname === "/") {
    if (!token) return redirectToLogin();
  }

  // 4. Token na ho toh login bhejo
  if (!token) {
    return redirectToLogin("unauthorized");
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = String(payload.role || "").toUpperCase();

    // 5. Super Admin cross-leak roko: Super Admin direct yahan aaye toh use uske dashboard bhejo
    if (userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(SUPER_ADMIN_URL));
    }

    // 6. Sirf Studio Admin ya Admin ko allow karo
    if (userRole !== "ADMIN" && userRole !== "STUDIO_ADMIN" && userRole !== "CLIENT") {
      return redirectToLogin("forbidden");
    }

    // 7. Token query handshake (clean URL)
    if (tokenFromQuery) {
      const isProduction = process.env.NODE_ENV === "production";
      const cleanUrl = req.nextUrl.clone();
      cleanUrl.searchParams.delete("token");

      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set("eventqr_session", tokenFromQuery, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set("eventqr_session_role", userRole, {
        path: "/",
        httpOnly: false,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch {
    return redirectToLogin("invalid_session");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};