"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calendar, Plus, Clock, CheckCircle2, XCircle, 
  Sparkles, ExternalLink, SlidersHorizontal, Loader2, 
  ArrowRight, Lock, Image as ImageIcon, RefreshCw, HardDrive,
  LogOut
} from "lucide-react";
import Link from "next/link";

interface EventItem {
  id: string;
  title: string;
  type: string;
  slug: string;
  status: string;
  eventDate: string;
  isLive: boolean;
  retentionDays?: number;
  allowGuestUpload: boolean;
  _count?: { albums: number };
}

type ThemeMode = "dark" | "blue" | "light";

export default function MyEventsPage() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("WEDDING");
  const [eventDate, setEventDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [retentionDays, setRetentionDays] = useState<number>(15);

  // 1. Strict Direct URL Guard + Theme Hydration
  useEffect(() => {
    setMounted(true);

    try {
      const savedTheme = localStorage.getItem("admin_theme") as ThemeMode | null;
      if (savedTheme && (savedTheme === "dark" || savedTheme === "blue" || savedTheme === "light")) {
        setTheme(savedTheme);
      }
    } catch {}

    const session = typeof window !== "undefined" ? localStorage.getItem("studio_client_session") || localStorage.getItem("eventqr_user") : null;
    const hasCookie = typeof document !== "undefined" && document.cookie.includes("eventqr_session");

    if (!session && !hasCookie) {
      window.location.replace("/login?error=session_expired");
    }
  }, []);

  const changeTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("admin_theme", newTheme);
    } catch {}
  };

  const getClientId = () => {
    if (typeof window === "undefined") return "";
    try {
      const session = localStorage.getItem("studio_client_session");
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.id || "";
      }
    } catch {
      return "";
    }
    return "";
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const cid = getClientId();
      const res = await fetch(`/api/events${cid ? `?clientId=${encodeURIComponent(cid)}` : ""}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({ success: false, events: [] }));
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Fetch err:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchEvents();
    }
  }, [mounted, fetchEvents]);

  // Live Date Change -> Auto calculate 15 Days Default Expiry
  const handleEventDateChange = (selectedDate: string) => {
    setEventDate(selectedDate);
    if (selectedDate) {
      const start = new Date(selectedDate);
      if (!isNaN(start.getTime())) {
        const defaultExp = new Date(start);
        defaultExp.setDate(start.getDate() + 15);
        const formattedExp = defaultExp.toISOString().split("T")[0];
        setExpiryDate(formattedExp);
        setRetentionDays(15);
      }
    } else {
      setExpiryDate("");
      setRetentionDays(15);
    }
  };

  // Expiry Date Picker Change -> Recalculate Storage Days dynamically
  const handleExpiryDateChange = (selectedExp: string) => {
    setExpiryDate(selectedExp);
    if (eventDate && selectedExp) {
      const start = new Date(eventDate);
      const end = new Date(selectedExp);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setRetentionDays(diffDays > 0 ? diffDays : 1);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !expiryDate) {
      alert("Please fill all required event and storage date parameters.");
      return;
    }

    setCreating(true);

    try {
      const cid = getClientId();

      const payload = {
        clientId: cid,
        title: title.trim().slice(0, 150),
        type,
        eventDate,
        expiryDate,
        retentionDays: Math.max(1, retentionDays),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({ success: false }));
      if (res.ok && data.success) {
        setShowModal(false);
        setTitle("");
        setEventDate("");
        setExpiryDate("");
        setRetentionDays(15);
        await fetchEvents();
        alert("✅ Event request submitted! Super Admin will review & approve it.");
      } else {
        alert(data.error || data.message || "Failed to submit event request");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      alert("Security warning: Error creating event: " + msg);
    } finally {
      setCreating(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}

    const expiredSuffix = "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;";
    document.cookie = `eventqr_session${expiredSuffix}`;
    document.cookie = `eventqr_session_role${expiredSuffix}`;
    document.cookie = `admin_token${expiredSuffix}`;
    document.cookie = `client_token${expiredSuffix}`;

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    window.location.replace("/login?error=logged_out");
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030712] text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const themeClasses = {
    dark: {
      wrapper: "bg-[#030712] text-slate-100",
      card: "bg-[#080c14] border-slate-800/80",
      cardHover: "hover:border-pink-500/40",
      textPrimary: "text-white",
      textMuted: "text-slate-400",
      btnSecondary: "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700",
      modalBg: "bg-[#080c14] border-slate-800",
      inputBg: "bg-slate-900 border-slate-800 text-white",
    },
    blue: {
      wrapper: "bg-[#0a1128] text-slate-100",
      card: "bg-[#060c1e] border-blue-900/40",
      cardHover: "hover:border-blue-500/50",
      textPrimary: "text-white",
      textMuted: "text-blue-300/70",
      btnSecondary: "bg-[#0e1b3d] border-blue-900/60 text-blue-200 hover:text-white",
      modalBg: "bg-[#060c1e] border-blue-900/60",
      inputBg: "bg-[#0e1b3d] border-blue-900/60 text-white",
    },
    light: {
      wrapper: "bg-[#f8fafc] text-slate-900",
      card: "bg-[#ffffff] border-slate-200",
      cardHover: "hover:border-pink-400",
      textPrimary: "text-slate-900",
      textMuted: "text-slate-500",
      btnSecondary: "bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400",
      modalBg: "bg-[#ffffff] border-slate-200",
      inputBg: "bg-slate-100 border-slate-300 text-slate-900",
    },
  }[theme];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClasses.wrapper} font-sans`}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-black flex items-center gap-2 tracking-tight ${themeClasses.textPrimary}`}>
              My Live Events <Sparkles className="w-6 h-6 text-pink-500" />
            </h1>
            <p className={`text-xs mt-1 ${themeClasses.textMuted}`}>
              Super Admin approved events are ready to be configured with viewer settings, themes, and galleries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Selector */}
            <div className="flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/50">
              <button
                type="button"
                onClick={() => changeTheme("dark")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  theme === "dark" ? "bg-pink-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => changeTheme("blue")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  theme === "blue" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Blue
              </button>
              <button
                type="button"
                onClick={() => changeTheme("light")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  theme === "light" ? "bg-white text-slate-900 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Light
              </button>
            </div>

            <button
              type="button"
              onClick={fetchEvents}
              className={`p-2.5 border rounded-xl transition cursor-pointer ${themeClasses.btnSecondary}`}
              title="Refresh List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-pink-600/25 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Event Request</span>
            </button>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition cursor-pointer"
              title="Exit Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : events.length === 0 ? (
          <div className={`border border-dashed rounded-3xl p-16 text-center ${themeClasses.card}`}>
            <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className={`font-bold text-sm ${themeClasses.textPrimary}`}>No Events Registered Yet</h3>
            <p className={`text-xs mt-1 ${themeClasses.textMuted}`}>
              Submit your first event request to Super Admin for approval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const rawStatus = String(ev.status || "").toUpperCase();
              const isApproved = ev.isLive || rawStatus === "APPROVED" || rawStatus === "ACTIVE";
              const isRejected = rawStatus === "REJECTED";

              return (
                <div
                  key={ev.id}
                  className={`border rounded-3xl p-6 space-y-5 transition flex flex-col justify-between shadow-2xl ${themeClasses.card} ${themeClasses.cardHover}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {ev.type}
                      </span>

                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Pending Approval
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className={`text-xl font-black mt-1 line-clamp-1 ${themeClasses.textPrimary}`}>
                        {ev.title}
                      </h3>
                      <p className={`text-[11px] font-mono mt-0.5 ${themeClasses.textMuted}`}>
                        /{ev.slug}
                      </p>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/50">
                      <span suppressHydrationWarning>
                        Live: {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : "N/A"}
                      </span>
                      <span className="font-semibold text-slate-300 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                        <span>{ev._count?.albums || 0} Album(s)</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-700/50">
                    {isApproved ? (
                      <>
                        <Link
                          href={`/events/${ev.id}/setup`}
                          className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:opacity-95 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-pink-500/25 group cursor-pointer"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                          <span>Complete Setup &amp; Launch Event</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <a
                          href={`http://localhost:3000/e/${ev.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`w-full py-2 px-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${themeClasses.btnSecondary}`}
                        >
                          <span>Preview Big Screen Feed</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </>
                    ) : (
                      <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                        <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                        <span>Setup unlocks once Super Admin approves</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal - Create Event Request */}
        {showModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className={`border w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 ${themeClasses.modalBg}`}>
              <div>
                <h3 className={`text-xl font-black ${themeClasses.textPrimary}`}>Create New Event</h3>
                <p className={`text-xs mt-0.5 ${themeClasses.textMuted}`}>
                  This request will be sent to Super Admin for validation &amp; approval.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className={`text-[11px] font-bold uppercase ${themeClasses.textMuted}`}>
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Rahul &amp; Priya Wedding"
                    className={`w-full mt-1.5 border rounded-xl px-4 py-2.5 text-sm focus:border-pink-500 outline-none transition ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`text-[11px] font-bold uppercase ${themeClasses.textMuted}`}>
                    Event Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`w-full mt-1.5 border rounded-xl px-4 py-2.5 text-sm focus:border-pink-500 outline-none cursor-pointer transition ${themeClasses.inputBg}`}
                  >
                    <option value="WEDDING">💍 Wedding Ceremony</option>
                    <option value="RECEPTION">🥂 Grand Reception</option>
                    <option value="CORPORATE">🏢 Corporate Summit</option>
                    <option value="BIRTHDAY">🎂 Birthday Bash</option>
                    <option value="ANNIVERSARY">✨ Anniversary Gala</option>
                  </select>
                </div>

                <div>
                  <label className={`text-[11px] font-bold uppercase flex items-center justify-between ${themeClasses.textMuted}`}>
                    <span>Event Live Date</span>
                    <span className="text-[10px] text-emerald-500 font-semibold lowercase">Live starts from this date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => handleEventDateChange(e.target.value)}
                    className={`w-full mt-1.5 border rounded-xl px-4 py-2.5 text-sm focus:border-pink-500 outline-none cursor-pointer transition ${themeClasses.inputBg}`}
                  />
                </div>

                <div className={`border rounded-2xl p-4 space-y-3 ${theme === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-900/90 border-slate-800/90"}`}>
                  <div className="flex items-center justify-between">
                    <label className={`text-[11px] font-bold uppercase flex items-center gap-1.5 ${themeClasses.textMuted}`}>
                      <HardDrive className="w-3.5 h-3.5 text-pink-500" />
                      <span>Storage &amp; QR Expiry Date</span>
                    </label>
                    <span className="text-xs font-black text-pink-500 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
                      {retentionDays} {retentionDays === 1 ? "Day" : "Days"} Active
                    </span>
                  </div>

                  <div>
                    <input
                      type="date"
                      required
                      min={eventDate || undefined}
                      value={expiryDate}
                      onChange={(e) => handleExpiryDateChange(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:border-pink-500 outline-none cursor-pointer transition ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div className={`flex items-center justify-between text-[11px] pt-1 ${themeClasses.textMuted}`}>
                    <span>Default duration: 15 Days</span>
                    <span>QR locks automatically post-expiry</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2.5 text-xs font-bold transition cursor-pointer ${themeClasses.textMuted} hover:text-white`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-black rounded-xl shadow-lg shadow-pink-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}