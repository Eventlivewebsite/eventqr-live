"use client";

import React from "react";
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
} from "lucide-react";
import "./globals.css";

const MAIN_LOGIN_GATEWAY_URL = "https://eventqr-live-admin.vercel.app/login";

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

  const handleExitSession = () => {
    // 1. Purge all related session cookies across domain paths
    const expiredSuffix = "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;";
    document.cookie = `super_admin_token${expiredSuffix}`;
    document.cookie = `super_admin_session${expiredSuffix}`;
    document.cookie = `token${expiredSuffix}`;
    document.cookie = `session${expiredSuffix}`;

    // 2. Clear all client storage
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // Fallback for restricted storage environments
      }

      // 3. Absolute handover to central gateway
      window.location.href = MAIN_LOGIN_GATEWAY_URL;
    }
  };

  return (
    <html lang="en">
      <body className="bg-[#030712] text-slate-100 antialiased min-h-screen font-sans selection:bg-pink-500 selection:text-white">
        {isAuthPage ? (
          <main className="min-h-screen">{children}</main>
        ) : (
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
                          <Icon className={`w-4 h-4 ${isActive ? "text-pink-400" : "text-slate-500"}`} />
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
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Session</span>
                </button>
              </div>
            </aside>

            {/* Main Area with Top Header */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top Navigation Header */}
              <header className="h-16 border-b border-slate-800/80 bg-[#080c14]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-white capitalize">
                    {pathname === "/" ? "Dashboard" : pathname.replace("/", "").replace("-", " ")}
                  </h2>
                  <span className="text-xs text-slate-500">| Welcome back 👋</span>
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
                      A
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-bold text-white leading-none">Admin</p>
                      <p className="text-[10px] text-slate-500 leading-none mt-1">Super Admin</p>
                    </div>
                  </div>
                </div>
              </header>

              {/* Dynamic Page Content */}
              <main className="flex-1 p-8 bg-[#030712] overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}