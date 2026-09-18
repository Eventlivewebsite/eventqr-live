"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Save,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  QrCode,
  Download,
  Tag,
  Clock,
  CheckCircle2,
  Film,
  Users,
  Utensils,
  Lock,
  Unlock,
  ShieldCheck,
  HardDrive,
  Printer,
  Award,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function MasterEventSetupPage() {
  const params = useParams();
  const eventId = String(params?.id || "");

  const [activeTab, setActiveTab] = useState<
    "HERO" | "SECURITY" | "STORAGE" | "DECORATION" | "TIMELINE" | "FAMILY" | "MENU" | "REPORT" | "QR"
  >("HERO");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [eventData, setEventData] = useState<any>(null);
  const [occasionLabel, setOccasionLabel] = useState("WEDDING");

  const [heroTag, setHeroTag] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [venueName, setVenueName] = useState("");
  const [activeCeremony, setActiveCeremony] = useState("");
  const [ceremonyTime, setCeremonyTime] = useState("");

  const [accessMode, setAccessMode] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [pinCode, setPinCode] = useState("");
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [autoCompress, setAutoCompress] = useState(true);

  const [retentionDays, setRetentionDays] = useState(15);
  const [isSoftDeleted, setIsSoftDeleted] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState("");

  const [decorationZones, setDecorationZones] = useState<string[]>([]);
  const [newDecorInput, setNewDecorInput] = useState("");

  const [albums, setAlbums] = useState<{ name: string; count: number }[]>([]);

  const [timeline, setTimeline] = useState<
    { title: string; time: string; status: "UPCOMING" | "LIVE" | "COMPLETED" }[]
  >([]);
  const [newProgTitle, setNewProgTitle] = useState("");
  const [newProgTime, setNewProgTime] = useState("");

  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);

  const viewerBaseUrl =
    typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      ? "https://eventqr-live-viewer.vercel.app"
      : "http://localhost:3000";

  const eventSlug = eventData?.slug || "event-" + eventId.slice(-6);
  const liveViewerUrl = `${viewerBaseUrl}/e/${eventSlug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    liveViewerUrl
  )}`;

  const loadEventConfig = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/configure`, { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.event) {
        const ev = data.event;
        setEventData(ev);
        setOccasionLabel(ev.type || "WEDDING");
        setHeroTag(ev.heroTag || "LIVE EVENT");
        setTitle(ev.welcomeHeading || ev.title || "Celebration");
        setSubtitle(ev.welcomeSubtext || "Forever Begins Today");
        setVenueName(ev.venueName || "Jaipur Palace");
        setActiveCeremony(ev.activeCeremony || "Main Ceremony");
        setCeremonyTime(ev.ceremonyStartTime || "18:00");

        setAccessMode(ev.accessMode === "PRIVATE" ? "PRIVATE" : "PUBLIC");
        setPinCode(ev.pinCode || "");
        setAllowDownloads(ev.allowDownloads ?? true);
        setAllowComments(ev.allowComments ?? true);
        setAutoCompress(ev.autoCompress ?? true);
        setRetentionDays(ev.retentionDays || 15);

        setCategories(ev.categories || []);
        setAlbums(ev.albums || []);
        setDecorationZones(ev.decorationZones || []);
        setTimeline(ev.timeline || []);
        setFamilyMembers(ev.familyMembers || []);
        setFoodItems(ev.foodItems || []);
      }
    } catch (err) {
      console.error("Failed to load event configuration", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEventConfig();
  }, [loadEventConfig]);

  const handleAddCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = newCatInput.trim();
    if (!val) return;
    if (!categories.includes(val)) setCategories((prev) => [...prev, val]);
    setNewCatInput("");
  };

  const handleAddDecor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = newDecorInput.trim();
    if (!val) return;
    if (!decorationZones.includes(val)) setDecorationZones((prev) => [...prev, val]);
    setNewDecorInput("");
  };

  const handleAddTimeline = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const t = newProgTitle.trim();
    const tm = newProgTime.trim() || "TBD";
    if (!t) return;
    setTimeline((prev) => [...prev, { title: t, time: tm, status: "UPCOMING" }]);
    setNewProgTitle("");
    setNewProgTime("");
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      const payload = {
        title: title.trim(),
        welcomeHeading: title.trim(),
        welcomeSubtext: subtitle.trim(),
        venueName: venueName.trim(),
        heroTag: heroTag.trim(),
        activeCeremony: activeCeremony.trim(),
        ceremonyStartTime: ceremonyTime.trim(),
        accessMode,
        pinCode: accessMode === "PRIVATE" ? pinCode.trim() : null,
        allowDownloads,
        allowComments,
        autoCompress,
        retentionDays,
        categories: categories.map((c) => c.trim()).filter(Boolean),
        albums,
        decorationZones,
        timeline,
        familyMembers,
        foodItems,
      };

      const res = await fetch(`/api/events/${eventId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        alert(data?.error || "Deployment failed.");
      }
    } catch {
      alert("Network error occurred during deployment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <span className="text-sm font-mono text-slate-400">Loading Master Control Studio...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Events Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-white">{title}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase tracking-wider">
              {occasionLabel} SUITE
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                accessMode === "PRIVATE"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {accessMode === "PRIVATE" ? "Private (PIN)" : "Public QR"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Direct Link: /{eventSlug}</p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Live Deployed!
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:opacity-95 text-white rounded-2xl text-xs font-black transition shadow-xl shadow-pink-600/30 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Deploy to Viewer Feed</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-[#080c14] border border-slate-800 rounded-2xl">
        {[
          { id: "HERO", label: "Hero & Tracker", icon: Sparkles },
          { id: "SECURITY", label: "Privacy & Controls", icon: ShieldCheck },
          { id: "STORAGE", label: "Storage & Retention", icon: HardDrive },
          { id: "DECORATION", label: "Decoration Albums", icon: Film },
          { id: "TIMELINE", label: "Program Flow", icon: Clock },
          { id: "FAMILY", label: "Family Profiles", icon: Users },
          { id: "MENU", label: "Food & Drinks", icon: Utensils },
          { id: "REPORT", label: "Luxury Memory Book", icon: Award },
          { id: "QR", label: "Live QR Studio", icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-pink-600 text-white shadow-md shadow-pink-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "HERO" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" /> Hero Banner & Live Ceremony Countdown
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Top Badge Tag</label>
              <input
                type="text"
                value={heroTag}
                onChange={(e) => setHeroTag(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Venue (Location)</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Subtitle / Tagline</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "SECURITY" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Guest Privacy & Viewing Security
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setAccessMode("PUBLIC")}
              className={`p-5 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                accessMode === "PUBLIC"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                  : "bg-[#030712] border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase text-white">Public QR Scan Access</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Anyone scanning the QR code views photos, videos, and ceremony details directly.
                </p>
              </div>
            </div>

            <div
              onClick={() => setAccessMode("PRIVATE")}
              className={`p-5 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                accessMode === "PRIVATE"
                  ? "bg-amber-500/10 border-amber-500/40 text-white"
                  : "bg-[#030712] border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase text-white">Private (PIN Required)</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Guests scan the QR code and must enter a 4-digit PIN code to unlock the album.
                </p>
              </div>
            </div>
          </div>

          {accessMode === "PRIVATE" && (
            <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
              <label className="text-[11px] font-bold text-amber-400 uppercase">Guest Access PIN Code</label>
              <input
                type="text"
                placeholder="e.g. 2026"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full max-w-sm bg-[#030712] border border-amber-500/40 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-amber-400"
              />
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Viewer Feature Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 bg-[#030712] border border-slate-800 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-white block">Viewer Photo/Video Downloads</span>
                  <span className="text-[10px] text-slate-500">Allow guests to download high-resolution media.</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowDownloads}
                  onChange={(e) => setAllowDownloads(e.target.checked)}
                  className="w-4 h-4 accent-pink-500 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-[#030712] border border-slate-800 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-white block">Guest Comments & Wishes</span>
                  <span className="text-[10px] text-slate-500">Enable public guest book remarks and likes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="w-4 h-4 accent-pink-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === "STORAGE" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" /> Cloud Storage Retention & Lifecycle
            </h2>
          </div>
          <div className="p-5 bg-[#030712] border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white uppercase">Smart Real-time Auto-Compression (WebP / AVIF)</h3>
              <p className="text-[11px] text-slate-400">Automatically compresses heavy camera photos into sub-500KB viewing assets.</p>
            </div>
            <input
              type="checkbox"
              checked={autoCompress}
              onChange={(e) => setAutoCompress(e.target.checked)}
              className="w-5 h-5 accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-sky-400 uppercase">Live Storage Retention Period</h3>
                <p className="text-[10px] text-slate-500">Default is 15 Days. Expandable up to 365 Days.</p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {retentionDays} Days Active
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[15, 30, 60, 90, 180, 365].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setRetentionDays(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    retentionDays === d
                      ? "bg-sky-500 text-white border-sky-400"
                      : "bg-[#030712] text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-rose-400 uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> 2-Step Safe Deletion Architecture
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Events enter a 30-day temporary Recycle Bin (Soft Delete) before permanent purging.
            </p>
            {!isSoftDeleted ? (
              <button
                type="button"
                onClick={() => setIsSoftDeleted(true)}
                className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Move to 30-Day Recycle Bin
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSoftDeleted(false)}
                className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore from Recycle Bin
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "DECORATION" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-pink-400" /> Decoration Zones & Video Hub
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-pink-400">{decorationZones.length} Zones</span>
          </div>

          <form onSubmit={handleAddDecor} className="flex gap-2">
            <input
              type="text"
              placeholder="Add new decoration zone..."
              value={newDecorInput}
              onChange={(e) => setNewDecorInput(e.target.value)}
              className="flex-1 bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/40 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add Zone
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {decorationZones.map((zone, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-[#030712] border border-slate-800 rounded-xl">
                <span className="font-bold text-white text-xs">{zone}</span>
                <button
                  type="button"
                  onClick={() => setDecorationZones(decorationZones.filter((_, i) => i !== idx))}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4" /> Guest Gallery Filter Chips
              </h3>
              <span className="text-xs font-mono font-bold text-sky-400">{categories.length} Chips</span>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="Add filter chip..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                className="flex-1 bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/40 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Chip
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200">
                  <span className="font-semibold">{c}</span>
                  <button type="button" onClick={() => setCategories(categories.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400 transition cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "TIMELINE" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Live Ceremony Flow & Timeline
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{timeline.length} Slots</span>
          </div>

          <form onSubmit={handleAddTimeline} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Ceremony Title"
              value={newProgTitle}
              onChange={(e) => setNewProgTitle(e.target.value)}
              className="sm:col-span-2 bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="06:00 PM"
                value={newProgTime}
                onChange={(e) => setNewProgTime(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
              <button type="submit" className="flex items-center justify-center px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold transition cursor-pointer shrink-0">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </form>

          <div className="space-y-2 pt-2">
            {timeline.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-[#030712] border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">{item.time}</span>
                  <span className="font-bold text-white text-xs">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTimeline(
                        timeline.map((it, idx) => {
                          if (idx !== i) return it;
                          const next = it.status === "UPCOMING" ? "LIVE" : it.status === "LIVE" ? "COMPLETED" : "UPCOMING";
                          return { ...it, status: next };
                        })
                      );
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border cursor-pointer transition ${
                      item.status === "LIVE" ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse" : item.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {item.status}
                  </button>
                  <button type="button" onClick={() => setTimeline(timeline.filter((_, idx) => idx !== i))} className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "FAMILY" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" /> Family Profiles
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setFamilyMembers([...familyMembers, { id: String(Date.now()), name: "Relative Name", role: "Role", bio: "Blessings." }])}
              className="flex items-center gap-1 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {familyMembers.map((member, idx) => (
              <div key={member.id || idx} className="p-4 bg-[#030712] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">Profile #{idx + 1}</span>
                  <button type="button" onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400 transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => setFamilyMembers(familyMembers.map((m, i) => i === idx ? { ...m, name: e.target.value } : m))}
                    placeholder="Full Name"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => setFamilyMembers(familyMembers.map((m, i) => i === idx ? { ...m, role: e.target.value } : m))}
                    placeholder="Relation / Role"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "MENU" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" /> Food & Drinks Menu
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setFoodItems([...foodItems, { id: String(Date.now()), category: "Special", name: "Dish Title", isVeg: true, isPopular: false }])}
              className="flex items-center gap-1 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Dish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {foodItems.map((dish, idx) => (
              <div key={dish.id || idx} className="p-4 bg-[#030712] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={dish.name}
                    onChange={(e) => setFoodItems(foodItems.map((f, i) => i === idx ? { ...f, name: e.target.value } : f))}
                    className="bg-transparent font-bold text-xs text-white outline-none border-b border-dashed border-slate-700 w-2/3"
                  />
                  <button type="button" onClick={() => setFoodItems(foodItems.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400 transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "REPORT" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Executive Memory Folio & Post-Event Report
              </h2>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Luxury Folio
            </button>
          </div>
        </div>
      )}

      {activeTab === "QR" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6 text-center">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" /> Guest Entry QR Code Studio
          </h2>
          <div className="bg-white p-6 rounded-2xl mx-auto w-fit shadow-2xl border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeUrl} alt={`QR for ${title}`} className="w-56 h-56 mx-auto" />
            <p className="text-slate-900 font-black text-xs mt-3 tracking-wider uppercase">{title}</p>
            <p className="text-[10px] text-slate-500 font-mono">{liveViewerUrl.replace(/^https?:\/\//, "")}</p>
          </div>
          <div className="flex justify-center gap-3 max-w-md mx-auto">
            <a href={liveViewerUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 flex-1 py-3 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700">
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" /> Preview View
            </a>
            <a href={qrCodeUrl} download={`${eventSlug}-qr.png`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 flex-1 py-3 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-bold transition border border-emerald-500/30">
              <Download className="w-3.5 h-3.5" /> Download QR
            </a>
          </div>
        </div>
      )}
    </div>
  );
}