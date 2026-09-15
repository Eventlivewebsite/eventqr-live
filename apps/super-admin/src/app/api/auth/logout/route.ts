import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/super-admin";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAdminSession(response);
  return response;
}
