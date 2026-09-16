import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

// Fallback ko seedha aapke live admin login URL par set kar diya gaya hai
const STUDIO_LOGIN_URL =
  process.env.NEXT_PUBLIC_STUDIO_ADMIN_URL ||
  "https://eventqr-live-admin.vercel.app/login";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Assets, API routes aur static files ko bypass karein
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. Cross-Domain Token Transfer: Pehle URL searchParams se token check karein, fir cookie se
  const tokenFromQuery = searchParams.get("token");
  const tokenFromCookie = req.cookies.get("eventqr_session")?.value;
  const token = tokenFromQuery || tokenFromCookie;

  const roleFromCookie = req.cookies.get("eventqr_session_role")?.value;

  // Helper function: Live Admin Login par redirect karne ke liye
  const redirectToLogin = (reason: string) => {
    const loginUrl = new URL(STUDIO_LOGIN_URL);
    loginUrl.searchParams.set("error", reason);
    return NextResponse.redirect(loginUrl.toString());
  };

  if (!token) {
    return redirectToLogin("unauthorized");
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Strict Role Validation
    if (payload.role !== "SUPER_ADMIN") {
      return redirectToLogin("forbidden");
    }

    // Agar token query param se aaya hai (cross-domain login), toh ise super-admin domain ki cookie mein save karein
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
      response.cookies.set("eventqr_session_role", "SUPER_ADMIN", {
        path: "/",
        httpOnly: false,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
  } catch {
    return redirectToLogin("invalid_session");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};