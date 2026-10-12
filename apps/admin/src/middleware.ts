import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const DEFAULT_SECRET = "eventqr_super_secure_key_2026_production_safe_string_32";
const RAW_JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const JWT_SECRET = new TextEncoder().encode(RAW_JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Static assets aur API routes ko bypass karo
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

  // 2. /login route ko hamesha khulne do
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const tokenFromQuery = searchParams.get("token");
  const sessionCookie =
    req.cookies.get("eventqr_session")?.value ||
    req.cookies.get("admin_token")?.value;

  const token = tokenFromQuery || sessionCookie;

  const clearAndRedirect = (reason?: string) => {
    const loginUrl = new URL("/login", req.url);
    if (reason) loginUrl.searchParams.set("error", reason);

    const res = NextResponse.redirect(loginUrl);
    // Saari cookies delete karo
    res.cookies.delete("eventqr_session");
    res.cookies.delete("admin_token");
    res.cookies.delete("eventqr_session_role");
    res.cookies.delete("client_token");
    res.cookies.delete("super_admin_session");
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  };

  if (!token) {
    return clearAndRedirect();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = String(payload.role || "").toUpperCase();

    // Valid authenticated response
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch {
    // Agar JWT expired ya invalid hai, toh purani cookie delete karke login par bhejo
    return clearAndRedirect("session_expired");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
