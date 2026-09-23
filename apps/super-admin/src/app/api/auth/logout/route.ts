import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ 
    success: true, 
    message: "Super admin session successfully terminated." 
  });

  const expiredOpts = {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  // Saari possible session aur auth cookies ko server-side se instantly clean karein
  response.cookies.set("eventqr_session", "", expiredOpts);
  response.cookies.set("eventqr_session_role", "", { ...expiredOpts, httpOnly: false });
  response.cookies.set("super_admin_session", "", expiredOpts);
  response.cookies.set("super_admin_token", "", expiredOpts);
  response.cookies.set("token", "", expiredOpts);
  response.cookies.set("admin_token", "", expiredOpts);
  response.cookies.set("client_token", "", expiredOpts);

  // Strict Anti-Cache Headers (Logout ke baad browser history cache block karne ke liye)
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export async function GET() {
  return POST();
}