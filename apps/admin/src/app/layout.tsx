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

    if (isLoginPage) {
      setChecking(false);
      return;
    }

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

  if (!mounted) {
    return (
      <html lang="en">
        <body className="bg-slate-900 min-h-screen text-slate-100 font-sans antialiased">
          {children}
        </body>
      </html>
    );
  }

  if (isLoginPage) {
    return (
      <html lang="en">
        <body className="bg-slate-950 min-h-screen text-slate-100 font-sans antialiased">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased h-screen overflow-hidden flex">
        {/* Sticky Fixed Sidebar */}
        <aside className="w-64 flex-shrink-0 h-screen overflow-y-auto border-r border-slate-200 bg-white">
          <StudioSidebar />
        </aside>

        {/* Scrollable Main Content Form */}
        <main className="flex-1 h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}