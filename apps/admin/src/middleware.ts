import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const RAW_JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(
  RAW_JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Static chunks, assets, and APIs bypass
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

  // 2. Token Extraction
  const tokenFromQuery = searchParams.get("token");
  const sessionCookie = req.cookies.get("eventqr_session")?.value;
  const token = tokenFromQuery || sessionCookie;

  // Helper: Redirect to login and clear bad cookies
  const redirectToLogin = (reason?: string) => {
    const loginUrl = new URL("/login", req.url);
    if (reason) loginUrl.searchParams.set("error", reason);
    if (pathname !== "/" && pathname !== "/login") {
      loginUrl.searchParams.set("redirect", pathname);
    }

    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("eventqr_session");
    res.cookies.delete("eventqr_session_role");
    res.cookies.delete("admin_token");
    res.cookies.delete("client_token");
    return res;
  };

  // 3. Login Page Handling
  if (pathname === "/login") {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = String(payload.role || "").toUpperCase();
        if (role === "ADMIN" || role === "STUDIO_ADMIN" || role === "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } catch {
        // Token invalid hai, login page khulne do
      }
    }
    return NextResponse.next();
  }

  // 4. Direct visit without any token -> Reject instantly
  if (!token) {
    return redirectToLogin("unauthorized");
  }

  try {
    // 5. Cryptographic Signature & Expiry Verification
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = String(payload.role || "").toUpperCase();

    // 6. Role Authorization Gate
    const isAuthorized =
      userRole === "ADMIN" ||
      userRole === "STUDIO_ADMIN" ||
      userRole === "SUPER_ADMIN";

    if (!isAuthorized) {
      return redirectToLogin("forbidden");
    }

    // 7. Token Handshake from Query (agar URL me ?token=... aaya ho)
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
      return response;
    }

    // 8. Prevent browser/proxy caching of protected dashboards
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