"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  SlidersHorizontal,
  QrCode,
  ShieldAlert,
  LogOut,
  Camera,
  Radio,
} from "lucide-react";

const navigation = [
  { name: "Live Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Events", href: "/events", icon: Calendar },
  { name: "Viewer Feed Moderation", href: "/feed", icon: ShieldAlert },
  { name: "Photos & Media", href: "/media", icon: ImageIcon },
  { name: "QR Standees & Sharing", href: "/qr-stands", icon: QrCode },
  { name: "Viewer Display Settings", href: "/viewer-controls", icon: SlidersHorizontal },
];

export default function StudioSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out of Studio Portal?")) {
      return;
    }

    try {
      // 1. Server-side session & HttpOnly cookies destroy karein
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout network dispatch failed:", error);
    }

    // 2. Dusre sabhi open tabs ko BroadcastChannel ke through LOGOUT signal bhejein
    try {
      const authChannel = new BroadcastChannel("auth_sync_channel");
      authChannel.postMessage("LOGOUT");
      authChannel.close();
    } catch {
      // BroadcastChannel unavailable fallback
    }

    // 3. Legacy / Fallback tab sync & client cache clear
    localStorage.setItem("eventqr_logout_event", Date.now().toString());
    localStorage.removeItem("studio_client_session");
    sessionStorage.clear();

    // 4. Hard redirect to login screen
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 min-h-screen p-6 flex flex-col justify-between select-none">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
            EventQR <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Live</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Camera className="w-3.5 h-3.5 text-pink-500" />
            <p className="text-[11px] text-pink-400 font-bold uppercase tracking-wider">
              Studio Client Portal
            </p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navigation.map((item) => {
            // Root "/" exact match, baaki sabhi routes ke liye nested path match
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-black/40 border border-slate-800"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-pink-500" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {/* Live Broadcast Status Indicator */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Viewer Engine</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Active
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Real-time sync enabled for guest screens.
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900/60 hover:bg-red-600/20 text-slate-400 hover:text-red-400 border border-slate-800/80 rounded-2xl text-xs font-semibold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Studio</span>
        </button>
      </div>
    </aside>
  );
}