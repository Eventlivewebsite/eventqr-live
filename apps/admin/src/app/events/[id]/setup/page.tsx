"use client";

import React, { useState, useEffect, use, useCallback } from "react";
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
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  FolderPlus,
  ListPlus,
  Tag,
  Share2,
} from "lucide-react";

interface AlbumItem {
  name: string;
  count: number;
}

interface TimelineItem {
  title: string;
  time: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
}

const OCCASION_PRESETS = [
  { id: "WEDDING", label: "Wedding Celebration" },
  { id: "CORPORATE", label: "Corporate Summit / Event" },
  { id: "BIRTHDAY", label: "Birthday Celebration" },
  { id: "ANNIVERSARY", label: "Anniversary" },
  { id: "ENGAGEMENT", label: "Ring Ceremony / Engagement" },
  { id: "CUSTOM", label: "Custom Occasion (Own Template)" },
];

export default function EventSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState(false);

  // Core Event Data
  const [eventData, setEventData] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [venueName, setVenueName] = useState("");

  // Occasion Type & Custom Handling
  const [occasionType, setOccasionType] = useState("WEDDING");
  const [customOccasionName, setCustomOccasionName] = useState("");

  // Dynamic Lists
  const [categories, setCategories] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState("");

  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [newAlbumName, setNewAlbumName] = useState("");

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [newProgTitle, setNewProgTitle] = useState("");
  const [newProgTime, setNewProgTime] = useState("");

  const viewerBaseUrl =
    typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      ? "https://eventqr-live-viewer.vercel.app"
      : "http://localhost:3000";

  const liveViewerUrl = eventData?.slug ? `${viewerBaseUrl}/e/${eventData.slug}` : "";
  const qrCodeUrl = liveViewerUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
        liveViewerUrl
      )}`
    : "";

  // Load Initial Event Data
  const loadEventConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/configure`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.event) {
        const ev = data.event;
        setEventData(ev);
        setTitle(ev.welcomeHeading || ev.title || ev.name || "");
        setSubtitle(ev.welcomeSubtext || "Forever Begins Today");
        setVenueName(ev.venueName || "");

        // Determine Occasion Type
        const incomingType = (ev.type || "WEDDING").toUpperCase();
        const isPreset = OCCASION_PRESETS.some((p) => p.id === incomingType);
        if (isPreset && incomingType !== "CUSTOM") {
          setOccasionType(incomingType);
        } else {
          setOccasionType("CUSTOM");
          setCustomOccasionName(ev.type || "");
        }

        // Populate Categories
        if (Array.isArray(ev.categories) && ev.categories.length > 0) {
          setCategories(ev.categories);
        } else {
          setCategories(["Ceremony", "Haldi", "Mehendi", "Reception"]);
        }

        // Populate Albums
        if (Array.isArray(ev.albums) && ev.albums.length > 0) {
          setAlbums(
            ev.albums.map((a: any) => ({
              name: a.name || a.title || "Album",
              count: a.count ?? 0,
            }))
          );
        } else {
          setAlbums([
            { name: "Highlights", count: 0 },
            { name: "Family & Guests", count: 0 },
          ]);
        }

        // Populate Timeline
        if (Array.isArray(ev.timeline) && ev.timeline.length > 0) {
          setTimeline(
            ev.timeline.map((t: any) => ({
              title: t.title || "Ceremony",
              time: t.time || t.timeText || "18:00",
              status: (t.status || t.statusText || "UPCOMING") as any,
            }))
          );
        } else {
          setTimeline([
            { title: "Main Ceremony", time: "06:00 PM", status: "UPCOMING" },
            { title: "Dinner & Reception", time: "08:00 PM", status: "UPCOMING" },
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch event configuration:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEventConfig();
  }, [loadEventConfig]);

  // 1. Category Chips Handlers
  const handleAddCategory = () => {
    const clean = newCatInput.trim();
    if (!clean) return;
    if (!categories.includes(clean)) {
      setCategories((prev) => [...prev, clean]);
    }
    setNewCatInput("");
  };

  const handleRemoveCategory = (idx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  // 2. Album Handlers
  const handleAddAlbum = () => {
    const clean = newAlbumName.trim();
    if (!clean) return;
    if (!albums.some((a) => a.name.toLowerCase() === clean.toLowerCase())) {
      setAlbums((prev) => [...prev, { name: clean, count: 0 }]);
    }
    setNewAlbumName("");
  };

  const handleRemoveAlbum = (idx: number) => {
    setAlbums((prev) => prev.filter((_, i) => i !== idx));
  };

  // 3. Program / Timeline Handlers
  const handleAddProgram = () => {
    const cleanTitle = newProgTitle.trim();
    const cleanTime = newProgTime.trim() || "TBD";
    if (!cleanTitle) return;

    setTimeline((prev) => [
      ...prev,
      {
        title: cleanTitle,
        time: cleanTime,
        status: "UPCOMING",
      },
    ]);
    setNewProgTitle("");
    setNewProgTime("");
  };

  const handleRemoveProgram = (idx: number) => {
    setTimeline((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleTimelineStatus = (idx: number) => {
    setTimeline((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const nextStatus =
          item.status === "UPCOMING"
            ? "LIVE"
            : item.status === "LIVE"
            ? "COMPLETED"
            : "UPCOMING";
        return { ...item, status: nextStatus };
      })
    );
  };

  // Save All Configurations
  const handleSaveConfiguration = async () => {
    try {
      setSaving(true);
      setSaveBanner(false);

      const finalOccasion =
        occasionType === "CUSTOM"
          ? customOccasionName.trim() || "CUSTOM"
          : occasionType;

      const payload = {
        title: title.trim(),
        welcomeHeading: title.trim(),
        welcomeSubtext: subtitle.trim(),
        venueName: venueName.trim(),
        type: finalOccasion,
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
        setSaveBanner(true);
        setTimeout(() => setSaveBanner(false), 4000);
      } else {
        alert(data?.error || data?.message || "Failed to update configuration.");
      }
    } catch {
      alert("Network error occurred while deploying configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        <span className="text-xs font-mono">Loading studio event configurations...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Header */}
      <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Events Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {title || "Event Customization"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              {eventData?.status || "APPROVED"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Direct Link: /{eventData?.slug}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveBanner && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Live Deployed!
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveConfiguration}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-pink-500/25 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Deploy to Viewer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configurations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Occasion & Primary Details */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" /> Event Occasion & Branding
              </h2>
              <span className="text-[10px] font-mono text-slate-500">ID: {eventData?.id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Occasion Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Event Occasion Type
                </label>
                <select
                  value={occasionType}
                  onChange={(e) => setOccasionType(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-pink-500 cursor-pointer"
                >
                  {OCCASION_PRESETS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Occasion Input Field (Shown only when CUSTOM is selected) */}
              {occasionType === "CUSTOM" && (
                <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <label className="text-[11px] font-bold text-pink-400 uppercase">
                    Your Custom Occasion Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sangeet Night, Product Launch, House Warming"
                    value={customOccasionName}
                    onChange={(e) => setCustomOccasionName(e.target.value)}
                    className="w-full bg-[#030712] border border-pink-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>
              )}

              {/* Venue Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Grand Palace, Ballroom A"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Welcome Heading (Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Welcome Subtext (Tagline)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* 1. Category Chips Manager */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-sky-400" /> Event Category Chips
                </h2>
                <p className="text-[11px] text-slate-400">
                  Visible filter tabs for guests on viewer screens.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400">
                {categories.length} Chips
              </span>
            </div>

            {/* Add Chip Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Category Tag (e.g. Ring Ceremony, Party)"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className="flex-1 bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex items-center gap-1 px-4 py-2 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Chip
              </button>
            </div>

            {/* Chips List */}
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((cat, idx) => (
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
              ))}
            </div>
          </div>

          {/* 2. Albums Manager */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-emerald-400" /> Photo & Media Albums
                </h2>
                <p className="text-[11px] text-slate-400">
                  Dedicated storage folders for guest photo submissions.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {albums.length} Albums
              </span>
            </div>

            {/* Add Album Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Album Title (e.g. Stage Portraits, Reception Highlights)"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAlbum()}
                className="flex-1 bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddAlbum}
                className="flex items-center gap-1 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Album
              </button>
            </div>

            {/* Albums List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {albums.map((alb, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#030712] border border-slate-800/80 rounded-xl text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{alb.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alb.count} uploads stored
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAlbum(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Event Program (Timeline) Manager */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-amber-400" /> Event Schedule & Programs
                </h2>
                <p className="text-[11px] text-slate-400">
                  Live timeline shown on guest mobile displays.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {timeline.length} Slots
              </span>
            </div>

            {/* Add Program Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Program / Ceremony Title"
                value={newProgTitle}
                onChange={(e) => setNewProgTitle(e.target.value)}
                className="sm:col-span-2 bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Time (e.g. 07:30 PM)"
                  value={newProgTime}
                  onChange={(e) => setNewProgTime(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddProgram}
                  className="flex items-center justify-center px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Timeline List */}
            <div className="space-y-2 pt-1">
              {timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#030712] border border-slate-800/80 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      {item.time}
                    </span>
                    <span className="font-bold text-white">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleTimelineStatus(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border cursor-pointer transition ${
                        item.status === "LIVE"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse"
                          : item.status === "COMPLETED"
                          ? "bg-slate-800 text-slate-500 border-slate-700"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                      title="Click to toggle status"
                    >
                      {item.status}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProgram(idx)}
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

        {/* Right Column: Live Guest QR Code Card */}
        <div className="space-y-6">
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-6 text-center shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" /> Guest Entry QR Code
              </h2>
              <p className="text-[11px] text-slate-400">
                Scan opens guest mobile view for photo uploads & live feed.
              </p>
            </div>

            {/* QR Visual */}
            <div className="bg-white p-5 rounded-2xl mx-auto w-fit shadow-2xl border border-slate-200">
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt={`Live QR Code for ${eventData?.slug}`}
                  className="w-52 h-52 mx-auto"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
              <p className="text-slate-900 font-black text-xs mt-3 tracking-wider uppercase">
                {title || eventData?.slug}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {liveViewerUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {liveViewerUrl && (
                <a
                  href={liveViewerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Preview Guest Mobile View</span>
                </a>
              )}

              {qrCodeUrl && (
                <a
                  href={qrCodeUrl}
                  download={`${eventData?.slug || "event"}-qr.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-xl text-xs font-bold transition border border-emerald-500/30 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Print-Ready QR</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}