"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Images,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";

const MAIN_LOGIN_GATEWAY_URL =
  process.env.NEXT_PUBLIC_STUDIO_ADMIN_URL ||
  "https://eventqr-live-admin.vercel.app/login";

export default function Sidebar() {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Cross-Tab Logout Listener (Background me dusre tabs ko monitor karne ke liye)
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

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Approval Requests", href: "/requests", icon: ShieldAlert },
    { label: "Gallery", href: "/gallery", icon: Images },
    { label: "QR Codes", href: "/qr-codes", icon: QrCode },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Server-side cookies destroy karein
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Safe fallback: network issue hone par bhi cleanup continue hoga
    }

    // 2. Broadcast Channel ke zariye baaki open tabs ko terminate signal bhejein
    try {
      const authChannel = new BroadcastChannel("auth_sync_channel");
      authChannel.postMessage("LOGOUT");
      authChannel.close();
    } catch {}

    // 3. Fallback Storage Event trigger karein
    try {
      localStorage.setItem("eventqr_logout_event", Date.now().toString());
    } catch {}

    // 4. Client-accessible cookies expire karein
    const expiredSuffix = "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;";
    document.cookie = `super_admin_session${expiredSuffix}`;
    document.cookie = `super_admin_token${expiredSuffix}`;
    document.cookie = `eventqr_session${expiredSuffix}`;
    document.cookie = `eventqr_session_role${expiredSuffix}`;
    document.cookie = `token${expiredSuffix}`;
    document.cookie = `session${expiredSuffix}`;
    document.cookie = `admin_token${expiredSuffix}`;
    document.cookie = `client_token${expiredSuffix}`;

    // 5. Local aur Session storage wipe karein
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}

      // 6. Hard redirect to central login gateway (replaces history stack)
      window.location.replace(`${MAIN_LOGIN_GATEWAY_URL}?error=logged_out`);
    }
  };

  return (
    <aside className="w-64 bg-[#080c14] border-r border-slate-800/80 min-h-screen p-5 flex flex-col justify-between shrink-0 font-sans select-none">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              EventQR{" "}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Live
              </span>
            </h1>
            <span className="px-2 py-0.5 text-[9px] font-black bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-md uppercase">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Enterprise Control Suite
          </p>
        </div>

        {/* Master Navigation Menu */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider px-3 mb-2">
            Master Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? "bg-gradient-to-r from-pink-600/20 to-rose-600/10 text-pink-400 border border-pink-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-pink-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile / Exit Session */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold text-xs">
            SA
          </div>
          <div className="overflow-hidden text-left">
            <div className="text-xs font-bold text-white truncate">Super Admin</div>
            <div className="text-[10px] text-slate-500 truncate">Full Tenant &amp; Quota Control</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span>{isLoggingOut ? "Ending Session..." : "Exit Session"}</span>
        </button>
      </div>
    </aside>
  );
}