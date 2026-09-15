import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

const STUDIO_LOGIN_URL =
  process.env.NEXT_PUBLIC_STUDIO_ADMIN_URL || "http://localhost:3002/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Assets, API routes aur internal Next.js paths ko bypass karein
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("eventqr_session")?.value;
  const roleCookie = req.cookies.get("eventqr_session_role")?.value;

  // Agar session token nahi hai ya role SUPER_ADMIN nahi hai, direct kickout
  if (!token || roleCookie !== "SUPER_ADMIN") {
    const loginUrl = new URL(STUDIO_LOGIN_URL);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl.toString());
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Strict validation: Token ke andar payload role SUPER_ADMIN hi hona chahiye
    if (payload.role !== "SUPER_ADMIN") {
      const loginUrl = new URL(STUDIO_LOGIN_URL);
      loginUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(loginUrl.toString());
    }
  } catch {
    const loginUrl = new URL(STUDIO_LOGIN_URL);
    loginUrl.searchParams.set("error", "invalid_session");
    return NextResponse.redirect(loginUrl.toString());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};