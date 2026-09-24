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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Agar login page hai toh authentication check skip karein
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    // 2. Client-side authentication check
    const session =
      typeof window !== "undefined"
        ? localStorage.getItem("studio_client_session") ||
          localStorage.getItem("eventqr_user")
        : null;

    const hasRoleCookie =
      typeof document !== "undefined" &&
      document.cookie.includes("eventqr_session");

    if (!session && !hasRoleCookie) {
      window.location.replace(
        `/login?error=unauthorized&redirect=${encodeURIComponent(
          pathname || ""
        )}`
      );
      return;
    }

    setHasValidSession(true);
    setChecking(false);

    // 3. Multi-Tab Synchronized Logout Listener
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

  // Initial SSR mount hone tak clean fallback taaki hydration break na ho
  if (!mounted) {
    return (
      <html lang="en">
        <body className="bg-[#030712] min-h-screen text-slate-100 font-sans antialiased">
          {children}
        </body>
      </html>
    );
  }

  // 1. LOGIN PAGE VIEW: Left sidebar 0% render hoga, clean full screen soft pink layout
  if (isLoginPage) {
    return (
      <html lang="en">
        <body className="bg-[#ffe4e6] min-h-screen font-sans antialiased overflow-x-hidden">
          <main className="min-h-screen w-full">{children}</main>
        </body>
      </html>
    );
  }

  // 2. PROTECTED STUDIO ADMIN PAGES VIEW
  return (
    <html lang="en">
      <body className="bg-[#030712] text-slate-100 min-h-screen font-sans antialiased selection:bg-pink-500 selection:text-white">
        <div className="flex min-h-screen w-full">
          {hasValidSession && <StudioSidebar />}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-inherit">
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