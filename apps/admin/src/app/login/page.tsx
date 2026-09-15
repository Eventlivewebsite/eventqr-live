"use client";

import React, { useState } from "react";
import {
  Camera,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

export default function UnifiedLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    const cleanIdentifier = email.trim().toLowerCase();
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
          password: cleanPassword,
        }),
      });

      const data = await res.json().catch(() => ({
        success: false,
        error: "Server response was invalid. Please try again.",
      }));

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("eventqr_user");
          localStorage.removeItem("studio_client_session");

          localStorage.setItem("eventqr_user", JSON.stringify(data.user));

          if (data.role === "STUDIO_ADMIN") {
            localStorage.setItem("studio_client_session", JSON.stringify(data.user));
          }
        }

        const role = String(data.role || "").toUpperCase();
        const fallbackSuperUrl =
          process.env.NEXT_PUBLIC_SUPER_ADMIN_URL || "http://localhost:3001/dashboard";

        // Strict Separation:
        if (role === "SUPER_ADMIN" || (data.redirectTo && data.redirectTo.includes("3001"))) {
          window.location.href = data.redirectTo || fallbackSuperUrl;
        } else {
          window.location.href = "/events";
        }
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-[#080c14] border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-rose-500/10 border border-pink-500/30 text-pink-500 shadow-inner">
              <Camera className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight">EventQR</span>
                <span className="text-2xl font-black text-pink-500 tracking-tight">Live</span>
                <Sparkles className="w-4 h-4 text-pink-400" />
              </div>

              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                <span>UNIFIED SECURE GATEWAY</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Role-authenticated portal. Access is strictly isolated per authorization tier.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Email or Studio Identifier
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eventqr.live or studio@gmail.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-pink-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Password
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-pink-500 transition disabled:opacity-50"
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
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:opacity-95 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition shadow-xl shadow-pink-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dedicated Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800/60">
            <p className="text-[11px] text-slate-500">
              Super Admins authenticate to <span className="text-slate-400 font-semibold">Super Admin Console</span>. Studio Admins route to <span className="text-slate-400 font-semibold">Studio Events</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}