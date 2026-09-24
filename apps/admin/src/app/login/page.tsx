"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Camera,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const LIVE_SUPER_ADMIN_URL =
  process.env.NEXT_PUBLIC_SUPER_ADMIN_URL ||
  "https://eventqr-live-super-admin.vercel.app";

type PortalRole = "SUPER_ADMIN" | "STUDIO_CLIENT";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<PortalRole>("SUPER_ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = role === "SUPER_ADMIN";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    const cleanIdentifier = email.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setError("Please enter your registered Email/ID and Password.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanIdentifier,
          loginId: cleanIdentifier,
          password: cleanPassword,
          portalRole: role,
        }),
      });

      const data = await res.json().catch(() => ({
        success: false,
        error: "Server response was invalid. Please try again.",
      }));

      if (res.ok && data.success) {
        // Backend se authenticated real role extract karein
        const authenticatedRole = String(
          data.role || data.user?.role || ""
        ).toUpperCase();
        const token = data.token || "";

        // Client cache safely clean karein taaki purane session se clash na ho
        if (typeof window !== "undefined") {
          localStorage.removeItem("eventqr_user");
          localStorage.removeItem("studio_client_session");

          localStorage.setItem("eventqr_user", JSON.stringify(data.user));

          if (authenticatedRole === "STUDIO_ADMIN" || authenticatedRole === "CLIENT") {
            localStorage.setItem("studio_client_session", JSON.stringify(data.user));
          }
        }

        // ============================================================
        // 1. STRICT SUPER ADMIN HANDOVER (Cross-Domain Token Handshake)
        // ============================================================
        if (authenticatedRole === "SUPER_ADMIN") {
          // Token query parameter me transfer karein taaki Super Admin portal verify kar sake
          const targetDomain = LIVE_SUPER_ADMIN_URL.replace(/\/$/, "");
          const handoverUrl = `${targetDomain}/?token=${encodeURIComponent(token)}`;

          window.location.replace(handoverUrl);
          return;
        }

        // ============================================================
        // 2. STRICT STUDIO ADMIN / CLIENT ROUTING
        // ============================================================
        if (authenticatedRole === "STUDIO_ADMIN" || authenticatedRole === "CLIENT" || authenticatedRole === "ADMIN") {
          window.location.replace("/events");
          return;
        }

        setError("Unrecognized account clearance level.");
        setLoading(false);
      } else {
        setError(data.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
      }
    } catch {
      setError("Network or server connection issue. Please retry.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 selection:bg-pink-500 selection:text-white font-sans">
      <div className="w-full max-w-[440px] bg-[#080d1a] border border-slate-800/80 rounded-[28px] p-8 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-white tracking-tight">EventQR</span>
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#be185d]/20 border border-[#be185d]/40 text-[#f43f5e]">
              GATE
            </span>
          </div>
          <p className="text-xs text-slate-400">Select your workspace portal to continue</p>
        </div>

        {/* Portal Switch Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-[#0e1424] border border-slate-800 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => {
              setRole("SUPER_ADMIN");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isSuperAdmin
                ? "bg-[#1e1c1b] text-[#f59e0b] border border-[#d97706]/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#f59e0b]" />
            <span>Super Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("STUDIO_CLIENT");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              !isSuperAdmin
                ? "bg-[#251322] text-[#f43f5e] border border-[#be185d]/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="w-4 h-4 text-slate-400" />
            <span>Studio Partner</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {isSuperAdmin ? "MASTER EMAIL" : "STUDIO ID OR EMAIL"}
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  isSuperAdmin ? "admin@eventqr.live" : "royal_studio or studio@mail.com"
                }
                className={`w-full bg-[#0e1424] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition disabled:opacity-50 ${
                  isSuperAdmin
                    ? "focus:border-[#ea580c]"
                    : "focus:border-[#e11d48]"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full bg-[#0e1424] border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-600 outline-none transition disabled:opacity-50 ${
                  isSuperAdmin
                    ? "focus:border-[#ea580c]"
                    : "focus:border-[#e11d48]"
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3.5 px-4 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xl ${
              isSuperAdmin
                ? "bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:opacity-95 shadow-orange-500/20"
                : "bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:opacity-95 shadow-pink-500/20"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>
                  {isSuperAdmin ? "Sign In to Super Suite" : "Sign In to Studio Portal"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}