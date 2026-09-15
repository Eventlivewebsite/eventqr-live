"use client";

import React, { useState } from "react";
import { ShieldAlert, Camera, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function UnifiedLoginPage() {
  const [role, setRole] = useState<"SUPER_ADMIN" | "STUDIO_CLIENT">("SUPER_ADMIN");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          portalRole: role,
        }),
      });

      const data = await res.json().catch(() => ({ success: false }));

      if (res.ok && data.success) {
        if (role === "STUDIO_CLIENT") {
          // Studio client redirect to port 3002
          window.location.href = data.redirectUrl || "http://localhost:3002/dashboard";
        } else {
          // Super admin stay on port 3001
          window.location.href = data.redirectUrl || "/requests";
        }
      } else {
        setError(data.error || "Authentication failed. Check your credentials.");
      }
    } catch {
      setError("Network connection failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712] p-4 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-[#080c14] border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Brand Logo Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            EventQR <span className="text-pink-500 text-sm font-mono uppercase px-2 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20">Gate</span>
          </h1>
          <p className="text-xs text-slate-400">Select your workspace portal to continue</p>
        </div>

        {/* Portal Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => { setRole("SUPER_ADMIN"); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              role === "SUPER_ADMIN"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole("STUDIO_CLIENT"); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              role === "STUDIO_CLIENT"
                ? "bg-pink-500/15 text-pink-400 border border-pink-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Studio Partner</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              {role === "SUPER_ADMIN" ? "Master Email" : "Studio ID or Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === "SUPER_ADMIN" ? "admin@eventqr.live" : "royal_studio or studio@mail.com"}
                className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-lg ${
              role === "SUPER_ADMIN"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 shadow-amber-500/10"
                : "bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 shadow-pink-500/10"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to {role === "SUPER_ADMIN" ? "Super Suite" : "Studio Portal"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}