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
  FolderPlus,
  Clock,
  CheckCircle2,
  Users,
  Utensils,
  Film,
} from "lucide-react";

export default function EventSetupPage() {
  const params = useParams();
  const eventId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Core Event States
  const [eventData, setEventData] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [venueName, setVenueName] = useState("");
  const [occasionType, setOccasionType] = useState("WEDDING");
  const [customOccasionName, setCustomOccasionName] = useState("");

  // Dynamic Lists (Add / Delete)
  const [categories, setCategories] = useState<string[]>(["Ceremony", "Haldi", "Mehendi", "Reception"]);
  const [newCatInput, setNewCatInput] = useState("");

  const [albums, setAlbums] = useState<{ name: string; count: number }[]>([
    { name: "Wedding", count: 0 },
    { name: "Haldi", count: 0 },
    { name: "Reception", count: 0 },
  ]);
  const [newAlbumInput, setNewAlbumInput] = useState("");

  const [timeline, setTimeline] = useState<
    { title: string; time: string; status: "UPCOMING" | "LIVE" | "COMPLETED" }[]
  >([
    { title: "Haldi Ceremony", time: "11:00 AM", status: "COMPLETED" },
    { title: "Wedding Reception", time: "06:00 PM", status: "LIVE" },
    { title: "Dinner", time: "08:00 PM", status: "UPCOMING" },
  ]);
  const [newProgTitle, setNewProgTitle] = useState("");
  const [newProgTime, setNewProgTime] = useState("");

  const viewerBaseUrl =
    typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      ? "https://eventqr-live-viewer.vercel.app"
      : "http://localhost:3000";

  const eventSlug = eventData?.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "event");
  const liveViewerUrl = `${viewerBaseUrl}/e/${eventSlug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(liveViewerUrl)}`;

  // Fetch Event Data Safely
  const loadEventData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/configure`, { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.event) {
        const ev = data.event;
        setEventData(ev);
        setTitle(ev.welcomeHeading || ev.title || "Wedding Celebration");
        setSubtitle(ev.welcomeSubtext || "Forever Begins Today");
        setVenueName(ev.venueName || "Jaipur Palace");

        if (Array.isArray(ev.categories) && ev.categories.length > 0) {
          setCategories(ev.categories);
        }
        if (Array.isArray(ev.albums) && ev.albums.length > 0) {
          setAlbums(ev.albums.map((a: any) => ({ name: a.name || a.title || "Album", count: a.count ?? 0 })));
        }
        if (Array.isArray(ev.timeline) && ev.timeline.length > 0) {
          setTimeline(ev.timeline);
        }
      }
    } catch (err) {
      console.error("Failed to load event data:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  // 1. ADD CHIP HANDLER
  const handleAddCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = newCatInput.trim();
    if (!val) return;
    if (!categories.includes(val)) {
      setCategories((prev) => [...prev, val]);
    }
    setNewCatInput("");
  };

  const handleRemoveCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  // 2. ADD ALBUM HANDLER
  const handleAddAlbum = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = newAlbumInput.trim();
    if (!val) return;
    if (!albums.some((a) => a.name.toLowerCase() === val.toLowerCase())) {
      setAlbums((prev) => [...prev, { name: val, count: 0 }]);
    }
    setNewAlbumInput("");
  };

  const handleRemoveAlbum = (index: number) => {
    setAlbums((prev) => prev.filter((_, i) => i !== index));
  };

  // 3. ADD TIMELINE HANDLER
  const handleAddTimeline = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const t = newProgTitle.trim();
    const tm = newProgTime.trim() || "TBD";
    if (!t) return;
    setTimeline((prev) => [...prev, { title: t, time: tm, status: "UPCOMING" }]);
    setNewProgTitle("");
    setNewProgTime("");
  };

  const handleRemoveTimeline = (index: number) => {
    setTimeline((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleTimelineStatus = (index: number) => {
    setTimeline((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next =
          item.status === "UPCOMING"
            ? "LIVE"
            : item.status === "LIVE"
            ? "COMPLETED"
            : "UPCOMING";
        return { ...item, status: next };
      })
    );
  };

  // Save Configurations to API
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      const finalType = occasionType === "CUSTOM" ? customOccasionName || "CUSTOM" : occasionType;

      const payload = {
        title: title.trim(),
        welcomeHeading: title.trim(),
        welcomeSubtext: subtitle.trim(),
        venueName: venueName.trim(),
        type: finalType,
        categories: categories.map((c) => c.trim()).filter(Boolean),
        albums: albums,
        timeline: timeline,
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
      alert("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <span className="text-xs font-mono text-slate-400">Loading Event Data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Events Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-white">{title || "Event Customization"}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              APPROVED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Direct Link: /{eventSlug}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Live Deployed!
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-pink-600/30 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Deploy to Viewer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Setup */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. OCCASION & BRANDING */}
          <div className="p-6 bg-[#080c14] border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" /> Event Occasion & Branding
              </h2>
              <span className="text-[10px] font-mono text-slate-500">ID: {eventId}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Event Occasion Type</label>
                <select
                  value={occasionType}
                  onChange={(e) => setOccasionType(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="WEDDING">Wedding Celebration</option>
                  <option value="BIRTHDAY">Birthday Celebration</option>
                  <option value="CORPORATE">Corporate Summit / Event</option>
                  <option value="CUSTOM">✨ Custom Occasion (Your Own)</option>
                </select>
              </div>

              {occasionType === "CUSTOM" ? (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-[11px] font-bold text-pink-400 uppercase">Custom Occasion Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sangeet Night, Reunion"
                    value={customOccasionName}
                    onChange={(e) => setCustomOccasionName(e.target.value)}
                    className="w-full bg-[#030712] border border-pink-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Venue / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. The Grand Palace, Ballroom A"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Welcome Heading (Title)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. A & S Wedding Celebration"
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Welcome Subtext (Tagline)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Forever Begins Today"
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* 2. CATEGORY CHIPS (Fixed Add & Enter Key) */}
          <div className="p-6 bg-[#080c14] border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-sky-400" /> Event Category Chips
                </h2>
                <p className="text-[11px] text-slate-400">Visible filter tabs on viewer screen.</p>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400">{categories.length} Chips</span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="New Category Tag (e.g. Haldi, Ring Ceremony, Party)"
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

            {/* Chips Container */}
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No chips added yet. Type above and click Add Chip.</p>
              ) : (
                categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                  >
                    <span className="font-semibold">{cat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(idx)}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. PHOTO & MEDIA ALBUMS (Fixed Add & Enter Key) */}
          <div className="p-6 bg-[#080c14] border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-emerald-400" /> Photo & Media Albums
                </h2>
                <p className="text-[11px] text-slate-400">Dedicated photo folders for viewer gallery.</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">{albums.length} Albums</span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddAlbum} className="flex gap-2">
              <input
                type="text"
                placeholder="New Album Title (e.g. Wedding Stage, Highlights)"
                value={newAlbumInput}
                onChange={(e) => setNewAlbumInput(e.target.value)}
                className="flex-1 bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Album
              </button>
            </form>

            {/* Albums List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {albums.length === 0 ? (
                <p className="text-xs text-slate-500 italic col-span-2">No albums added yet.</p>
              ) : (
                albums.map((alb, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-[#030712] border border-slate-800 rounded-xl"
                  >
                    <div>
                      <span className="font-bold text-white text-xs block">{alb.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{alb.count} uploads stored</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAlbum(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. EVENT TIMELINE */}
          <div className="p-6 bg-[#080c14] border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> Event Schedule & Timeline
                </h2>
                <p className="text-[11px] text-slate-400">Click the badge to toggle LIVE / UPCOMING / COMPLETED.</p>
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
                <button
                  type="submit"
                  className="flex items-center justify-center px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>

            <div className="space-y-2 pt-1">
              {timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#030712] border border-slate-800 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                      {item.time}
                    </span>
                    <span className="font-bold text-white">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleTimelineStatus(idx)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border cursor-pointer transition ${
                        item.status === "LIVE"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse"
                          : item.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {item.status}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeline(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Code Card */}
        <div className="space-y-6">
          <div className="p-6 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6 text-center shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" /> Guest Entry QR Code
              </h2>
              <p className="text-[11px] text-slate-400">Scan opens guest mobile view for photo uploads & feed.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl mx-auto w-fit shadow-2xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt={`Live QR Code for ${eventSlug}`}
                className="w-52 h-52 mx-auto"
              />
              <p className="text-slate-900 font-black text-xs mt-3 tracking-wider uppercase">
                {title || eventSlug}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {liveViewerUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={liveViewerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>Preview Guest View</span>
              </a>

              <a
                href={qrCodeUrl}
                download={`${eventSlug}-qr.png`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-xl text-xs font-bold transition border border-emerald-500/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print QR</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}