import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Cookies clear karna
  response.cookies.set("eventqr_session", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
  });

  response.cookies.set("eventqr_session_role", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}