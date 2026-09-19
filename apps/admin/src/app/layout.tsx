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
  const cookieStore = await cookies();
  const token =
    cookieStore.get("client_token")?.value ||
    cookieStore.get("admin_token")?.value ||
    cookieStore.get("eventqr_session")?.value;

  const hasInitialSession = Boolean(token && token.trim().length > 10);

  return (
    <html lang="en">
      <body className="bg-[#030712] text-slate-100 min-h-screen">
        <AuthEnforcer hasSession={hasInitialSession}>
          {children}
        </AuthEnforcer>
      </body>
    </html>
  );
}