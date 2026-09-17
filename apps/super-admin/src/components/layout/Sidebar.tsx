"use client";

import React from "react";
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
} from "lucide-react";

const MAIN_LOGIN_GATEWAY_URL = "https://eventqr-live-admin.vercel.app/login";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Approval Requests", href: "/requests", icon: ShieldAlert },
    { label: "Gallery", href: "/gallery", icon: Images },
    { label: "QR Codes", href: "/qr-codes", icon: QrCode },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    // 1. Clear all session cookies
    document.cookie = "super_admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // 2. Clear browser storages
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
      // 3. Direct browser redirect to central gateway
      window.location.href = MAIN_LOGIN_GATEWAY_URL;
    }
  };

  return (
    <aside className="w-64 bg-[#080c14] border-r border-slate-800/80 min-h-screen p-5 flex flex-col justify-between shrink-0 font-sans">
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
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Session</span>
        </button>
      </div>
    </aside>
  );
}