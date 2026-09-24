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

  // 1. Static files aur API routes bypass karein
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // 2. Token extraction (URL Query pehle, fir Cookies)
  const tokenFromQuery = searchParams.get("token");
  const tokenFromCookie =
    req.cookies.get("super_admin_session")?.value ||
    req.cookies.get("eventqr_session")?.value;

  const token = tokenFromQuery || tokenFromCookie;

  const redirectToLogin = (reason: string) => {
    const loginUrl = new URL(STUDIO_LOGIN_URL);
    loginUrl.searchParams.set("error", reason);

    const res = NextResponse.redirect(loginUrl.toString());
    res.cookies.set("super_admin_session", "", { path: "/", maxAge: 0 });
    res.cookies.set("super_admin_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("eventqr_session", "", { path: "/", maxAge: 0 });
    res.cookies.set("eventqr_session_role", "", { path: "/", maxAge: 0 });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  };

  // Direct visit bina token ke -> Redirect to login
  if (!token) {
    return redirectToLogin("unauthorized");
  }

  try {
    // 3. Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = String(payload.role || "").toUpperCase();

    // STRICT CHECK: Sirf SUPER_ADMIN allow hoga
    if (userRole !== "SUPER_ADMIN") {
      return redirectToLogin("forbidden_not_super_admin");
    }

    // 4. Token Handshake: Agar token URL me aaya hai, toh cookie set karein aur clean URL par bheinjein
    if (tokenFromQuery) {
      const isProduction = process.env.NODE_ENV === "production";
      const cleanUrl = req.nextUrl.clone();
      cleanUrl.searchParams.delete("token");

      const response = NextResponse.redirect(cleanUrl);

      response.cookies.set("super_admin_session", tokenFromQuery, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      response.cookies.set("eventqr_session_role", "SUPER_ADMIN", {
        path: "/",
        httpOnly: false,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });

      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }

    // 5. Valid session already present -> Allow access
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (err) {
    console.error("Super Admin Middleware Verification Failed:", err);
    return redirectToLogin("invalid_or_expired_token");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};