import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Security session invalidated successfully",
  });

  const cookiesToPurge = [
    "eventqr_session",
    "eventqr_session_role",
    "admin_token",
    "client_token",
    "super_admin_session",
    "super_admin_token",
    "token",
    "session",
  ];

  // 1. Saari auth aur role cookies ko immediate zero-expiry ke sath clean karein
  cookiesToPurge.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      maxAge: 0,
    });
  });

  // Non-httpOnly variant role cookie ko explicitly kill karein
  response.cookies.set("eventqr_session_role", "", {
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    maxAge: 0,
  });

  // 2. Strict Anti-Cache Headers (Browser history aur back button attack block)
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  // 3. Browser ko memory aur storage purge karne ka strict command
  response.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');

  return response;
}

export async function GET() {
  return POST();
}