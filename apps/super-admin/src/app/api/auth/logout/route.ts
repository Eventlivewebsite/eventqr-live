import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  const expiredOpts = {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  // Saari cookies ko server side se clean karein
  response.cookies.set("eventqr_session", "", expiredOpts);
  response.cookies.set("eventqr_session_role", "", { ...expiredOpts, httpOnly: false });
  response.cookies.set("super_admin_session", "", expiredOpts);
  response.cookies.set("super_admin_token", "", expiredOpts);
  response.cookies.set("token", "", expiredOpts);

  return response;
}