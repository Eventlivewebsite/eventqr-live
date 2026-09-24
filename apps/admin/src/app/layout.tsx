"use client";

import "./globals.css";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import StudioSidebar from "../components/layout/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname?.startsWith("/login");
  const [hasValidSession, setHasValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 1. Agar login page hai toh check skip karein
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    // 2. Client-side authentication check
    const session = localStorage.getItem("studio_client_session") || localStorage.getItem("eventqr_user");
    const hasRoleCookie = document.cookie.includes("eventqr_session");

    if (!session && !hasRoleCookie) {
      window.location.replace(`/login?error=unauthorized&redirect=${encodeURIComponent(pathname || "")}`);
      return;
    }

    setHasValidSession(true);
    setChecking(false);

    // 3. Cross-Tab Synchronized Logout Listener
    let authChannel: BroadcastChannel | null = null;
    if (typeof window.BroadcastChannel !== "undefined") {
      authChannel = new BroadcastChannel("auth_sync_channel");
      authChannel.onmessage = (ev) => {
        if (ev.data === "LOGOUT") {
          window.location.replace("/login?error=session_terminated");
        }
      };
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "eventqr_logout_event") {
        window.location.replace("/login?error=session_terminated");
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      if (authChannel) authChannel.close();
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [isLoginPage, pathname]);

  // LOGIN PAGE VIEW: Left sidebar 0% render hoga, clean screen
  if (isLoginPage) {
    return (
      <html lang="en">
        <body className="bg-slate-950 min-h-screen font-sans antialiased">
          <main className="min-h-screen w-full">{children}</main>
        </body>
      </html>
    );
  }

  // PROTECTED ADMIN PAGES VIEW
  return (
    <html lang="en">
      <body className="bg-[#030712] text-slate-100 min-h-screen antialiased">
        <div className="flex min-h-screen w-full">
          {hasValidSession && <StudioSidebar />}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#030712]">
            {checking ? (
              <div className="flex min-h-screen items-center justify-center bg-[#030712]">
                <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </body>
    </html>
  );
}