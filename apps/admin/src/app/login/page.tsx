"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Sparkles,
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

  // Cartoon reaction states
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = role === "SUPER_ADMIN";

  // Cursor tracking for Eyes & Head Tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPasswordFocused) return; // Password par hands/shy mode rehta hai

      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + 70; // Mascot head position

      const dx = e.clientX - faceCenterX;
      const dy = e.clientY - faceCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Max eye pupil movement range (-7px to +7px)
      const maxMove = 7;
      const moveX = Math.max(-maxMove, Math.min(maxMove, (dx / (dist || 1)) * maxMove));
      const moveY = Math.max(-maxMove, Math.min(maxMove, (dy / (dist || 1)) * maxMove));

      setPupilPos({ x: moveX, y: moveY });
      setHeadTilt(Math.max(-10, Math.min(10, (dx / 30))));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPasswordFocused]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanIdentifier,
          loginId: cleanIdentifier,
          password: cleanPassword,
          portalRole: role,
        }),
      });

      const data = await res.json().catch(() => ({
        success: false,
        error: "Server response invalid. Please check internet connection.",
      }));

      if (res.ok && data.success) {
        const authenticatedRole = String(
          data.role || data.user?.role || ""
        ).toUpperCase();
        const token = data.token || "";

        if (typeof window !== "undefined") {
          localStorage.removeItem("eventqr_user");
          localStorage.removeItem("studio_client_session");
          localStorage.setItem("eventqr_user", JSON.stringify(data.user));

          if (authenticatedRole === "STUDIO_ADMIN" || authenticatedRole === "CLIENT") {
            localStorage.setItem("studio_client_session", JSON.stringify(data.user));
          }
        }

        // Super Admin isolated transfer
        if (authenticatedRole === "SUPER_ADMIN") {
          const targetBase = LIVE_SUPER_ADMIN_URL.replace(/\/$/, "");
          window.location.replace(`${targetBase}/?token=${encodeURIComponent(token)}`);
          return;
        }

        // Studio Admin direct route
        if (
          authenticatedRole === "STUDIO_ADMIN" ||
          authenticatedRole === "CLIENT" ||
          authenticatedRole === "ADMIN"
        ) {
          window.location.replace("/events");
          return;
        }

        setError("Access clearance mismatch.");
        setLoading(false);
      } else {
        setError(data.error || "Invalid username or password.");
        setLoading(false);
      }
    } catch {
      setError("Unable to connect to authentication gateway.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffe4e6] via-[#fecdd3] to-[#fbcfe8] flex flex-col items-center justify-center p-4 selection:bg-pink-500 selection:text-white font-sans relative overflow-hidden">
      
      {/* Soft Ambient Pastel Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-300/40 rounded-full blur-3xl pointer-events-none" />

      {/* Interactive Cartoon Character Wrapper */}
      <div 
        className="relative -mb-8 z-20 flex flex-col items-center select-none"
        style={{
          transform: `rotate(${headTilt}deg)`,
          transition: "transform 0.15s ease-out",
        }}
      >
        {/* Character Head Body */}
        <div className="relative w-28 h-28 bg-[#fde047] border-4 border-slate-900 rounded-full flex flex-col items-center justify-center shadow-xl overflow-hidden">
          
          {/* Eyebrows */}
          <div className="flex gap-4 mb-1 z-10">
            <div className={`w-5 h-1.5 bg-slate-900 rounded-full transition-transform duration-200 ${isPasswordFocused ? "rotate-12 translate-y-1" : "-rotate-6"}`} />
            <div className={`w-5 h-1.5 bg-slate-900 rounded-full transition-transform duration-200 ${isPasswordFocused ? "-rotate-12 translate-y-1" : "rotate-6"}`} />
          </div>

          {/* Glasses Frame with Animated Pupils */}
          <div className="flex items-center gap-1 z-10">
            {/* Left Eye Glass */}
            <div className="w-10 h-10 bg-white border-[3.5px] border-slate-900 rounded-full relative flex items-center justify-center overflow-hidden shadow-inner">
              {isPasswordFocused ? (
                // Shy/Closed eye curve
                <div className="w-6 h-1 bg-slate-900 rounded-full translate-y-1" />
              ) : (
                // Moving Eyeball
                <div 
                  className="w-4 h-4 bg-slate-900 rounded-full relative transition-transform duration-75 ease-out"
                  style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 right-0.5" />
                </div>
              )}
            </div>

            {/* Glasses Bridge */}
            <div className="w-2 h-1 bg-slate-900 -mx-0.5" />

            {/* Right Eye Glass */}
            <div className="w-10 h-10 bg-white border-[3.5px] border-slate-900 rounded-full relative flex items-center justify-center overflow-hidden shadow-inner">
              {isPasswordFocused ? (
                <div className="w-6 h-1 bg-slate-900 rounded-full translate-y-1" />
              ) : (
                <div 
                  className="w-4 h-4 bg-slate-900 rounded-full relative transition-transform duration-75 ease-out"
                  style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 right-0.5" />
                </div>
              )}
            </div>
          </div>

          {/* Blushing Cheeks */}
          <div className="flex justify-between w-20 px-2 mt-1 z-10">
            <div className="w-3.5 h-2 bg-pink-400/80 rounded-full blur-[1px]" />
            <div className="w-3.5 h-2 bg-pink-400/80 rounded-full blur-[1px]" />
          </div>

          {/* Mouth Reaction */}
          <div className="z-10 mt-0.5 transition-all duration-200">
            {isPasswordFocused ? (
              <div className="w-3 h-2 border-b-2 border-slate-900 rounded-full" />
            ) : (
              <div className="w-4 h-2 bg-slate-900 rounded-b-full" />
            )}
          </div>

          {/* Animated Cartoon Hands (covers eyes on password focus) */}
          <div 
            className={`absolute inset-x-0 bottom-0 flex justify-between px-3 z-30 transition-transform duration-300 ease-out ${
              isPasswordFocused ? "translate-y-2" : "translate-y-16"
            }`}
          >
            <div className="w-7 h-9 bg-yellow-400 border-3 border-slate-900 rounded-full rotate-12 shadow" />
            <div className="w-7 h-9 bg-yellow-400 border-3 border-slate-900 rounded-full -rotate-12 shadow" />
          </div>
        </div>

        {isPasswordFocused && (
          <span className="text-[10px] font-black tracking-wider uppercase bg-pink-600 text-white px-3 py-0.5 rounded-full shadow-md mt-1 animate-bounce">
            🙈 No Peeking!
          </span>
        )}
      </div>

      {/* Login Card */}
      <div 
        ref={cardRef}
        className="w-full max-w-[440px] bg-white/95 backdrop-blur-xl border border-pink-200/90 rounded-[32px] p-8 shadow-2xl shadow-pink-500/15 space-y-6 z-10 transition-all"
      >
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              EventQR <span className="text-pink-600">Live</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-pink-50 text-pink-600 border border-pink-200">
              GATEWAY
            </span>
          </div>
          <p className="text-xs text-slate-500">Select portal to authenticate workspace</p>
        </div>

        {/* Portal Switch Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-pink-50/80 border border-pink-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => {
              setRole("SUPER_ADMIN");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isSuperAdmin
                ? "bg-white text-orange-600 shadow-sm border border-orange-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-orange-500" />
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
                ? "bg-white text-pink-600 shadow-sm border border-pink-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Camera className="w-4 h-4 text-pink-500" />
            <span>Studio Partner</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {isSuperAdmin ? "MASTER USERNAME / EMAIL" : "STUDIO LOGIN ID / EMAIL"}
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  isSuperAdmin ? "master@eventqr.live" : "royal_studio or studio@mail.com"
                }
                className="w-full bg-slate-50/80 border border-pink-100 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/10 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={password}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50/80 border border-pink-100 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/10 disabled:opacity-50"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
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
                ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25"
                : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-600/25"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span>
                  {isSuperAdmin ? "Access Super Suite" : "Enter Studio Portal"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-pink-100/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Enterprise Multi-Tenant Security Gateway</span>
        </div>
      </div>
    </div>
  );
}