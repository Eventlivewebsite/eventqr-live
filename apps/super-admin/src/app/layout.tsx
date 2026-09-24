"use client";

import React, { useState, useEffect } from "react";
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

// FIXED: Sahi verified routes configure kiye gaye hain
const NAVIGATION_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Approval Requests", href: "/approvals", icon: ShieldAlert },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "QR Codes", href: "/qr-codes", icon: QrCode },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

type ThemeMode = "dark" | "blue" | "light";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  // Load saved theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("super_admin_theme") as ThemeMode | null;
      if (savedTheme && (savedTheme === "dark" || savedTheme === "blue" || savedTheme === "light")) {
        setTheme(savedTheme);
      }
    } catch {}
  }, []);

  const changeTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("super_admin_theme", newTheme);
    } catch {}
  };

  // Cross-Tab Logout Listener: Kisi aur tab me logout hote hi instant termination
  useEffect(() => {
    let authChannel: BroadcastChannel | null = null;
    try {
      authChannel = new BroadcastChannel("auth_sync_channel");
      authChannel.onmessage = (event) => {
        if (event.data === "LOGOUT") {
          window.location.replace(`${MAIN_LOGIN_GATEWAY_URL}?error=session_terminated`);
        }
      };
    } catch {}

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "eventqr_logout_event") {
        window.location.replace(`${MAIN_LOGIN_GATEWAY_URL}?error=session_terminated`);
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      if (authChannel) authChannel.close();
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

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

    // Deep cookie & session eradication
    const expiredSuffix = "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;";
    document.cookie = `super_admin_session${expiredSuffix}`;
    document.cookie = `super_admin_token${expiredSuffix}`;
    document.cookie = `eventqr_session${expiredSuffix}`;
    document.cookie = `eventqr_session_role${expiredSuffix}`;

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    window.location.replace(`${MAIN_LOGIN_GATEWAY_URL}?error=logged_out`);
  };

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className="bg-[#030712] text-slate-100 antialiased min-h-screen font-sans">
          <main className="min-h-screen">{children}</main>
        </body>
      </html>
    );
  }

  // Exact Theme Configuration Classes
  const themeClasses = {
    dark: {
      body: "bg-[#030712] text-slate-100",
      sidebar: "bg-[#080c14] border-slate-800/80",
      header: "bg-[#080c14]/80 border-slate-800/80 text-white",
      main: "bg-[#030712]",
      input: "bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500",
      button: "bg-slate-900 border-slate-800 text-slate-400 hover:text-white",
      navHover: "hover:bg-slate-900/60 hover:text-white text-slate-400",
    },
    blue: {
      body: "bg-[#0a1128] text-slate-100",
      sidebar: "bg-[#060c1e] border-blue-900/40",
      header: "bg-[#060c1e]/85 border-blue-900/40 text-white",
      main: "bg-[#0a1128]",
      input: "bg-[#0e1b3d] border-blue-900/60 text-slate-100 placeholder-blue-400/60",
      button: "bg-[#0e1b3d] border-blue-900/60 text-blue-300 hover:text-white",
      navHover: "hover:bg-[#12234e] hover:text-blue-100 text-slate-300",
    },
    light: {
      body: "bg-[#f8fafc] text-slate-900",
      sidebar: "bg-[#ffffff] border-slate-200",
      header: "bg-[#ffffff]/90 border-slate-200 text-slate-900",
      main: "bg-[#f8fafc]",
      input: "bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400",
      button: "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900",
      navHover: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
    },
  }[theme];

  return (
    <html lang="en">
      <body className={`${themeClasses.body} antialiased min-h-screen font-sans selection:bg-pink-500 selection:text-white`}>
        <div className="flex min-h-screen w-full">
          {/* Left Master Sidebar */}
          <aside className={`w-64 border-r ${themeClasses.sidebar} flex flex-col justify-between p-5 shrink-0 sticky top-0 h-screen transition-colors duration-200`}>
            <div className="space-y-6">
              {/* Brand Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-black tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                    EventQR <span className="text-pink-500">Live</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 font-bold">
                    Super Admin
                  </span>
                </div>
                <p className="text-[11px] text-emerald-500 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Enterprise Control Suite
                </p>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider px-3 block mb-2">
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
                            ? "bg-gradient-to-r from-pink-500/20 to-purple-500/10 text-pink-500 border border-pink-500/30 font-bold shadow-sm"
                            : themeClasses.navHover
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? "text-pink-500" : "text-slate-400"
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
            <div className={`pt-4 border-t ${theme === "light" ? "border-slate-200" : "border-slate-800/80"} space-y-3`}>
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-500 font-bold flex items-center justify-center text-xs">
                  SA
                </div>
                <div className="overflow-hidden">
                  <p className={`text-xs font-bold truncate ${theme === "light" ? "text-slate-900" : "text-white"}`}>Super Admin</p>
                  <p className="text-[10px] text-slate-400 truncate">master@eventqr.live</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExitSession}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
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

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className={`h-16 border-b ${themeClasses.header} backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200`}>
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold capitalize">
                  {pathname === "/"
                    ? "Dashboard"
                    : pathname.replace("/", "").replace("-", " ")}
                </h2>
                <span className="text-xs text-slate-400">| Enterprise Clearance Mode</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search events, clients..."
                    className={`${themeClasses.input} border rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none w-56 focus:border-pink-500 transition`}
                  />
                </div>

                {/* Theme Selector (Dark, Blue, Light) */}
                <div className="flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => changeTheme("dark")}
                    title="Dark Theme"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      theme === "dark" ? "bg-pink-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => changeTheme("blue")}
                    title="Navy Blue Theme"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      theme === "blue" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Blue
                  </button>
                  <button
                    type="button"
                    onClick={() => changeTheme("light")}
                    title="Soft Light Theme"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      theme === "light" ? "bg-white text-slate-900 shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Light
                  </button>
                </div>

                <button
                  type="button"
                  className={`p-2 rounded-xl border ${themeClasses.button} transition cursor-pointer relative`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 absolute top-2 right-2"></span>
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs">
                    SA
                  </div>
                  <div className="text-left hidden md:block">
                    <p className={`text-xs font-bold leading-none ${theme === "light" ? "text-slate-900" : "text-white"}`}>Root</p>
                    <p className="text-[10px] text-pink-500 leading-none mt-1 font-mono font-semibold">SUPER_ADMIN</p>
                  </div>
                </div>
              </div>
            </header>

            <main className={`flex-1 p-8 ${themeClasses.main} overflow-y-auto transition-colors duration-200`}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}