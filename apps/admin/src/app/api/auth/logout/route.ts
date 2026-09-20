import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  const cookieNames = [
    "client_token",
    "admin_token",
    "eventqr_session",
    "eventqr_session_role",
    "token",
  ];

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  }

  return response;
}
