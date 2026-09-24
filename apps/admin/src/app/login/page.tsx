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

const SPRITE_URL =
  "https://raw.githubusercontent.com/nilbuild/page-mascot/main/characters/glasses/directions.png";

type PortalRole = "SUPER_ADMIN" | "STUDIO_CLIENT";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<PortalRole>("SUPER_ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grid coordinates: 3 cols (0: Left, 1: Center, 2: Right) x 2 rows (0: Up, 1: Down)
  const [col, setCol] = useState<0 | 1 | 2>(1);
  const [row, setRow] = useState<0 | 1>(1);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const mascotBoxRef = useRef<HTMLDivElement>(null);
  const isSuperAdmin = role === "SUPER_ADMIN";

  // Dynamic Cursor Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPasswordFocused) return;

      if (!mascotBoxRef.current) return;
      const rect = mascotBoxRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Horizontal tracking
      let nextCol: 0 | 1 | 2 = 1;
      if (deltaX < -50) nextCol = 0; // Look Left
      else if (deltaX > 50) nextCol = 2; // Look Right
      else nextCol = 1; // Look Center

      // Vertical tracking
      let nextRow: 0 | 1 = 1;
      if (deltaY < -20) nextRow = 0; // Look Up
      else nextRow = 1; // Look Down

      setCol(nextCol);
      setRow(nextRow);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPasswordFocused]);

  // Pixel-perfect background position calculation
  const getBackgroundPosition = () => {
    if (isPasswordFocused) {
      // Shy / Looking away when typing password
      return "100% 0%";
    }
    const posX = col === 0 ? "0%" : col === 1 ? "50%" : "100%";
    const posY = row === 0 ? "0%" : "100%";
    return `${posX} ${posY}`;
  };

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

        if (authenticatedRole === "SUPER_ADMIN") {
          const targetBase = LIVE_SUPER_ADMIN_URL.replace(/\/$/, "");
          window.location.replace(`${targetBase}/?token=${encodeURIComponent(token)}`);
          return;
        }

        if (
          authenticatedRole === "STUDIO_ADMIN" ||
          authenticatedRole === "CLIENT" ||
          authenticatedRole === "ADMIN"
        ) {
          window.location.replace("/events");
          return;
        }

        setError("Clearance level mismatch.");
        setLoading(false);
      } else {
        setError(data.error || "Invalid username or password.");
        setLoading(false);
      }
    } catch {
      setError("Unable to reach authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fce7f3] flex flex-col items-center justify-center p-4 selection:bg-pink-500 selection:text-white font-sans relative overflow-hidden">
      
      {/* Soft Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Mascot Housing Container */}
      <div 
        ref={mascotBoxRef}
        onClick={() => {
          setIsClicked(true);
          setTimeout(() => setIsClicked(false), 300);
        }}
        className="relative -mb-12 z-20 flex flex-col items-center select-none cursor-pointer"
      >
        {/* Outer Circular Ring */}
        <div className={`w-[124px] h-[124px] rounded-full p-[3px] bg-gradient-to-b from-white to-pink-200 shadow-xl flex items-center justify-center border border-white transition-transform duration-150 ${isClicked ? "scale-90" : "hover:scale-105"}`}>
          
          {/* Inner Clipping Mask: Strict 1-Frame Crop */}
          <div className="w-[114px] h-[114px] rounded-full overflow-hidden bg-[#eaf4fc] relative flex items-center justify-center">
            <div 
              className="w-full h-full rounded-full"
              style={{
                backgroundImage: `url(${SPRITE_URL})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "300% 200%",
                backgroundPosition: getBackgroundPosition(),
                transition: "background-position 0.05s ease-out",
              }}
            />
          </div>
        </div>

        {/* Shy Reaction Bubble */}
        {isPasswordFocused && (
          <span className="text-[10px] font-black uppercase tracking-wider bg-pink-600 text-white px-3 py-0.5 rounded-full shadow-md -mt-2 z-30 animate-bounce">
            🙈 No Peeking!
          </span>
        )}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[440px] bg-white/95 backdrop-blur-2xl border border-pink-200/90 rounded-[36px] p-8 pt-16 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.12)] space-y-6 z-10">
        
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              EventQR <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">Live</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200/80">
              GATEWAY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Select your portal to authenticate</p>
        </div>

        {/* Switch Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-pink-50/70 border border-pink-100 rounded-2xl gap-1">
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

        {/* Form */}
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
                onFocus={() => {
                  setRow(1);
                  setCol(1);
                }}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  isSuperAdmin ? "master@eventqr.live" : "royal_studio or studio@mail.com"
                }
                className="w-full bg-slate-50/80 border border-pink-100 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/10 disabled:opacity-50 font-medium"
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
                className="w-full bg-slate-50/80 border border-pink-100 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/10 disabled:opacity-50 font-medium"
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
            className={`w-full mt-2 py-3.5 px-4 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xl ${
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
          <span>Enterprise Multi-Tenant Security Shield</span>
        </div>
      </div>
    </div>
  );
}