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

  // 1. Static asset, internal endpoint aur file extensions bypass
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

  const tokenFromQuery = searchParams.get("token");
  const sessionCookie = req.cookies.get("eventqr_session")?.value;
  const token = tokenFromQuery || sessionCookie;

  const redirectToLogin = (reason?: string) => {
    const loginUrl = new URL("/login", req.url);
    if (reason) loginUrl.searchParams.set("error", reason);

    const res = NextResponse.redirect(loginUrl);
    // Eradicate untrusted or expired cookies immediately
    res.cookies.set("eventqr_session", "", { path: "/", maxAge: 0, expires: new Date(0) });
    res.cookies.set("eventqr_session_role", "", { path: "/", maxAge: 0, expires: new Date(0) });
    res.cookies.set("admin_token", "", { path: "/", maxAge: 0, expires: new Date(0) });
    res.cookies.set("client_token", "", { path: "/", maxAge: 0, expires: new Date(0) });
    res.cookies.set("super_admin_session", "", { path: "/", maxAge: 0, expires: new Date(0) });

    // Anti-Cache Lockdown
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  };

  // 2. Login Page Gate
  if (pathname === "/login") {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = String(payload.role || "").toUpperCase();

        // STRICT ISOLATION: Agar Super Admin hai toh Super Admin portal par transfer karo
        if (role === "SUPER_ADMIN") {
          return NextResponse.redirect(new URL(SUPER_ADMIN_URL));
        }

        // Sirf Studio Admin ya Admin hi /events me enter hoga
        if (role === "STUDIO_ADMIN" || role === "CLIENT" || role === "ADMIN") {
          return NextResponse.redirect(new URL("/events", req.url));
        }
      } catch {
        // Corrupt token, clear and allow login screen
      }
    }
    return NextResponse.next();
  }

  // 3. Direct unauthenticated visit rejection
  if (!token) {
    return redirectToLogin("unauthorized");
  }

  try {
    // 4. Cryptographic signature and expiration verification
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = String(payload.role || "").toUpperCase();

    // 5. Cross-Leakage Block: Super Admin galti se bhi /events ya admin internal routes me na ghuse
    if (userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(SUPER_ADMIN_URL));
    }

    // 6. Strict Role Gate: Sirf Studio Partner / Admin allowed
    if (userRole !== "ADMIN" && userRole !== "STUDIO_ADMIN" && userRole !== "CLIENT") {
      return redirectToLogin("forbidden");
    }

    // 7. Token Handshake from transfer query
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

      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }

    // 8. Prevent browser back/forward caching of protected content
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch {
    return redirectToLogin("invalid_session");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};