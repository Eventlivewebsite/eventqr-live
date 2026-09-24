"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Image as ImageIcon,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Loader2,
} from "lucide-react";
import "./globals.css";

const MAIN_LOGIN_GATEWAY_URL =
  process.env.NEXT_PUBLIC_STUDIO_ADMIN_URL ||
  "https://eventqr-live-admin.vercel.app/login";

const NAVIGATION_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Approval Requests", href: "/requests", icon: ShieldAlert },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "QR Codes", href: "/qr-codes", icon: QrCode },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const purgeClientState = useCallback(() => {
    const expiredSuffix = "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;";
    document.cookie = `super_admin_session${expiredSuffix}`;
    document.cookie = `super_admin_token${expiredSuffix}`;
    document.cookie = `eventqr_session${expiredSuffix}`;
    document.cookie = `eventqr_session_role${expiredSuffix}`;
    document.cookie = `token${expiredSuffix}`;
    document.cookie = `session${expiredSuffix}`;

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  }, []);

  const kickToLogin = useCallback(
    (reason: string) => {
      setIsAuthorized(false);
      setCheckingAuth(false);
      purgeClientState();
      window.location.replace(`${MAIN_LOGIN_GATEWAY_URL}?error=${encodeURIComponent(reason)}`);
    },
    [purgeClientState]
  );

  // 1. Strict Authorization Gate
  useEffect(() => {
    if (isAuthPage) {
      setCheckingAuth(false);
      setIsAuthorized(true);
      return;
    }

    const checkSuperAdminAuth = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasUrlToken = urlParams.has("token");

      // Strict check: Studio Admin cookie ko Super Admin nahi manna
      const allCookies = typeof document !== "undefined" ? document.cookie : "";
      const hasSuperAdminCookie =
        allCookies.includes("super_admin_session=") ||
        allCookies.includes("eventqr_session_role=SUPER_ADMIN");

      if (hasUrlToken || hasSuperAdminCookie) {
        setIsAuthorized(true);
        setCheckingAuth(false);
      } else {
        kickToLogin("super_admin_required");
      }
    };

    checkSuperAdminAuth();
  }, [pathname, isAuthPage, kickToLogin]);

  // 2. Multi-Tab Logout Sync: Kisi bhi tab me logout ho toh turant close ho
  useEffect(() => {
    let authChannel: BroadcastChannel | null = null;
    try {
      authChannel = new BroadcastChannel("auth_sync_channel");
      authChannel.onmessage = (event) => {
        if (event.data === "LOGOUT") {
          kickToLogin("session_terminated");
        }
      };
    } catch {}

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "eventqr_logout_event") {
        kickToLogin("session_terminated");
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      if (authChannel) authChannel.close();
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [kickToLogin]);

  // 3. Centralized Exit Session
  const handleExitSession = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    // Broadcast across all open tabs
    try {
      const authChannel = new BroadcastChannel("auth_sync_channel");
      authChannel.postMessage("LOGOUT");
      authChannel.close();
    } catch {}

    try {
      localStorage.setItem("eventqr_logout_event", Date.now().toString());
    } catch {}

    purgeClientState();
    window.location.replace(`${MAIN_LOGIN_GATEWAY_URL}?error=logged_out`);
  };

  return (
    <html lang="en">
      <body className="bg-[#030712] text-slate-100 antialiased min-h-screen font-sans selection:bg-pink-500 selection:text-white">
        {checkingAuth && !isAuthPage ? (
          <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            <span className="text-xs font-mono text-slate-400">
              Verifying Super Admin Cryptographic Clearance...
            </span>
          </div>
        ) : isAuthPage ? (
          <main className="min-h-screen">{children}</main>
        ) : isAuthorized ? (
          <div className="flex min-h-screen w-full">
            {/* Left Sidebar */}
            <aside className="w-64 border-r border-slate-800/80 bg-[#080c14] flex flex-col justify-between p-5 shrink-0 sticky top-0 h-screen">
              <div className="space-y-6">
                {/* Brand Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-white">
                      EventQR <span className="text-pink-500">Live</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Enterprise Control Suite
                  </p>
                </div>

                {/* Nav Links */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider px-3 block mb-2">
                    Master Menu
                  </span>
                  <nav className="space-y-1">
                    {NAVIGATION_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                            isActive
                              ? "bg-gradient-to-r from-pink-500/20 to-purple-500/10 text-pink-400 border border-pink-500/30"
                              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? "text-pink-400" : "text-slate-500"
                            }`}
                          />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Bottom Profile / Exit Session */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-400 font-bold flex items-center justify-center text-xs">
                    SA
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">Super Admin</p>
                    <p className="text-[10px] text-slate-500 truncate">master@eventqr.live</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExitSession}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>{isLoggingOut ? "Ending Session..." : "Exit Session"}</span>
                </button>
              </div>
            </aside>

            {/* Main Area with Top Header */}
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-16 border-b border-slate-800/80 bg-[#080c14]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-white capitalize">
                    {pathname === "/"
                      ? "Dashboard"
                      : pathname.replace("/", "").replace("-", " ")}
                  </h2>
                  <span className="text-xs text-slate-500">| Enterprise Clearance Mode</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search events, clients..."
                      className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none w-64 focus:border-pink-500"
                    />
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer relative"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 absolute top-2 right-2"></span>
                  </button>

                  <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs">
                      SA
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-bold text-white leading-none">Root</p>
                      <p className="text-[10px] text-pink-400 leading-none mt-1 font-mono">SUPER_ADMIN</p>
                    </div>
                  </div>
                </div>
              </header>

              <main className="flex-1 p-8 bg-[#030712] overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        ) : null}
      </body>
    </html>
  );
}