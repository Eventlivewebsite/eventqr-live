import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "eventqr-super-secure-jwt-secret-key";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    const token =
      req.cookies.get("client_token")?.value ||
      req.cookies.get("admin_token")?.value ||
      req.cookies.get("eventqr_session")?.value;

    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch {}
    }
    return NextResponse.next();
  }

  const tokenFromQuery = searchParams.get("token");
  const tokenFromCookie =
    req.cookies.get("client_token")?.value ||
    req.cookies.get("admin_token")?.value ||
    req.cookies.get("eventqr_session")?.value;

  const token = tokenFromQuery || tokenFromCookie;

  const redirectToLogin = (reason: string) => {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", reason);
    loginUrl.searchParams.set("redirect", pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("client_token");
    response.cookies.delete("admin_token");
    response.cookies.delete("eventqr_session");
    response.cookies.delete("eventqr_session_role");
    return response;
  };

  if (!token) {
    return redirectToLogin("unauthorized");
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload?.id) {
      return redirectToLogin("invalid_session");
    }

    if (tokenFromQuery) {
      const isProduction = process.env.NODE_ENV === "production";
      const cleanUrl = req.nextUrl.clone();
      cleanUrl.searchParams.delete("token");

      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set("client_token", tokenFromQuery, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin("invalid_session");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
