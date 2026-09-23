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
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Super Admin ke liye dedicated session cookie check karein taaki studio admin se clash na ho
  const tokenFromQuery = searchParams.get("token");
  const tokenFromCookie = 
    req.cookies.get("super_admin_session")?.value || 
    req.cookies.get("super_admin_token")?.value ||
    req.cookies.get("eventqr_session")?.value;

  const token = tokenFromQuery || tokenFromCookie;

  const redirectToLogin = (reason: string) => {
    const loginUrl = new URL(STUDIO_LOGIN_URL);
    loginUrl.searchParams.set("error", reason);

    const response = NextResponse.redirect(loginUrl.toString());
    response.cookies.set("super_admin_session", "", { path: "/", maxAge: 0 });
    response.cookies.set("super_admin_token", "", { path: "/", maxAge: 0 });
    return response;
  };

  if (!token) {
    return redirectToLogin("unauthorized");
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = String(payload.role || "").toUpperCase();

    // STRICT CHECK: Sirf SUPER_ADMIN hi enter kar sakega
    if (userRole !== "SUPER_ADMIN") {
      return redirectToLogin("forbidden_not_superadmin");
    }

    if (tokenFromQuery) {
      const isProduction = process.env.NODE_ENV === "production";
      const cleanUrl = req.nextUrl.clone();
      cleanUrl.searchParams.delete("token");

      const response = NextResponse.redirect(cleanUrl);
      
      // Super Admin ke liye alag isolated cookie set karein
      response.cookies.set("super_admin_session", tokenFromQuery, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 Hours
      });

      return response;
    }

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch {
    return redirectToLogin("invalid_token");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};