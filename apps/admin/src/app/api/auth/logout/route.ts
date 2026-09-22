import { NextResponse } from "next/server";

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
  ];

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

  return response;
}

export async function GET() {
  return POST();
}