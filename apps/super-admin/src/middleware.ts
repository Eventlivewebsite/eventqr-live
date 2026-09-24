import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

const STUDIO_LOGIN_URL =
  process.env.NEXT_PUBLIC_STUDIO_ADMIN_URL ||
  "https://eventqr-live-admin.vercel.app/login";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

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
  const tokenFromCookie =
    req.cookies.get("super_admin_session")?.value ||
    req.cookies.get("eventqr_session")?.value;

  const token = tokenFromQuery || tokenFromCookie;

  const forceLogin = (reason: string) => {
    const loginUrl = new URL(STUDIO_LOGIN_URL);
    loginUrl.searchParams.set("error", reason);

    const res = NextResponse.redirect(loginUrl.toString());
    const delList = ["super_admin_session", "super_admin_token", "eventqr_session", "eventqr_session_role"];
    delList.forEach((c) => res.cookies.set(c, "", { path: "/", maxAge: 0 }));

    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  };

  if (!token) {
    return forceLogin("unauthorized");
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = String(payload.role || "").toUpperCase();

    // SUPER_ADMIN clearance required
    if (userRole !== "SUPER_ADMIN") {
      return forceLogin("forbidden");
    }

    // Token query handshake
    if (tokenFromQuery) {
      const isProduction = process.env.NODE_ENV === "production";
      const cleanUrl = req.nextUrl.clone();
      cleanUrl.searchParams.delete("token");

      const res = NextResponse.redirect(cleanUrl);
      res.cookies.set("super_admin_session", tokenFromQuery, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      res.cookies.set("eventqr_session", tokenFromQuery, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });

      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return res;
    }

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch {
    return forceLogin("invalid_session");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};