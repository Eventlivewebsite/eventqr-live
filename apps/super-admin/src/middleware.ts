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

  // 1. Only bypass Next.js internal files, static chunks, and standard icons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // 2. Extract Token
  const tokenFromQuery = searchParams.get("token");
  const tokenFromCookie = req.cookies.get("eventqr_session")?.value;
  const token = tokenFromQuery || tokenFromCookie;

  const redirectToLogin = (reason: string) => {
    const loginUrl = new URL(STUDIO_LOGIN_URL);
    loginUrl.searchParams.set("error", reason);

    const response = NextResponse.redirect(loginUrl.toString());

    // Kill any existing invalid cookies immediately
    response.cookies.delete("eventqr_session");
    response.cookies.delete("eventqr_session_role");
    response.cookies.delete("super_admin_session");
    response.cookies.delete("super_admin_token");
    return response;
  };

  // Direct visit without any token -> Reject instantly
  if (!token) {
    return redirectToLogin("unauthorized");
  }

  try {
    // 3. Strict Cryptographic Verification
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Verify Role
    const userRole = String(payload.role || "").toUpperCase();
    if (userRole !== "SUPER_ADMIN") {
      return redirectToLogin("forbidden");
    }

    // 4. Token Handshake from URL Query -> Set secure cookie & clean URL
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
        maxAge: 60 * 60 * 24 * 7, // 7 days
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

    // 5. Valid session cookie present -> Grant entry
    return NextResponse.next();
  } catch {
    return redirectToLogin("invalid_session");
  }
}

export const config = {
  matcher: [
    /*
     * Match ALL routes including root `/` except internal static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};