import "./globals.css";
import React from "react";
import { cookies } from "next/headers";
import { AuthEnforcer } from "./AuthEnforcer";

export const metadata = {
  title: "EventQR Live - Studio Admin",
  description: "Enterprise Studio Event Control Center",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let hasSession = false;

  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("client_token")?.value ||
      cookieStore.get("admin_token")?.value ||
      cookieStore.get("eventqr_session")?.value;

    hasSession = Boolean(token && token.trim().length > 10);
  } catch {
    hasSession = false;
  }

  return (
    <html lang="en">
      <body className="bg-[#030712] text-slate-100 min-h-screen">
        <AuthEnforcer hasSession={hasSession}>{children}</AuthEnforcer>
      </body>
    </html>
  );
}