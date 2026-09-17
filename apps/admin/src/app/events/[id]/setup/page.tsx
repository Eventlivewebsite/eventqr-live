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
  Utensils,
  Users,
  Mail,
  Camera,
  Layers,
  Clock,
  CheckCircle2,
  Tv,
  Film,
  Sliders,
  Sparkle,
  Calendar,
  Flame,
} from "lucide-react";

const OCCASION_PRESETS: Record<string, any> = {
  WEDDING: {
    heroTag: "LIVE WEDDING EVENT",
    welcomeHeading: "A & S Wedding Celebration",
    welcomeSubtext: "Forever Begins Today",
    activeCeremony: "Wedding Reception",
    categories: ["Ceremony", "Haldi", "Mehendi", "Reception", "Family", "Party"],
    albums: [
      { name: "Wedding", count: 120 },
      { name: "Haldi", count: 85 },
      { name: "Reception", count: 210 },
    ],
    decorationZones: ["Wedding Stage", "Floral Decoration", "Lighting", "Entrance", "Dining", "Selfie Booth"],
    timeline: [
      { title: "Haldi Ceremony", time: "11:00 AM", status: "COMPLETED" },
      { title: "Wedding Reception", time: "06:00 PM", status: "LIVE" },
      { title: "Dinner", time: "08:00 PM", status: "UPCOMING" },
    ],
  },
  BIRTHDAY: {
    heroTag: "BIRTHDAY BASH LIVE",
    welcomeHeading: "Aarav's 1st Birthday Fiesta",
    welcomeSubtext: "One Year of Pure Joy",
    activeCeremony: "Cake Cutting Ceremony",
    categories: ["Cake Cutting", "Magic Show", "Kids Zone", "Family Moments", "Dance Party"],
    albums: [
      { name: "Cake Cutting", count: 65 },
      { name: "Kids Zone", count: 110 },
      { name: "Party Highlights", count: 145 },
    ],
    decorationZones: ["Balloon Arch", "Cake Stage", "Kids Play Area", "Selfie Backdrop"],
    timeline: [
      { title: "Guests Welcome", time: "05:00 PM", status: "COMPLETED" },
      { title: "Cake Cutting", time: "06:30 PM", status: "LIVE" },
      { title: "Magic Show & Dinner", time: "08:00 PM", status: "UPCOMING" },
    ],
  },
  CORPORATE: {
    heroTag: "ANNUAL SUMMIT 2026",
    welcomeHeading: "Global Leadership Summit",
    welcomeSubtext: "Innovate, Lead, Transform",
    activeCeremony: "Keynote Address",
    categories: ["Keynote", "Workshops", "Awards Gala", "Networking", "Dinner"],
    albums: [
      { name: "Keynote Stage", count: 95 },
      { name: "Team Innovation", count: 140 },
      { name: "Awards Ceremony", count: 180 },
    ],
    decorationZones: ["Main Stage", "Exhibition Lounge", "VIP Registration", "Dining Hall"],
    timeline: [
      { title: "Morning Registration", time: "09:00 AM", status: "COMPLETED" },
      { title: "Keynote Address", time: "10:30 AM", status: "LIVE" },
      { title: "Awards & Gala Dinner", time: "07:00 PM", status: "UPCOMING" },
    ],
  },
  CUSTOM: {
    heroTag: "LIVE EVENT",
    welcomeHeading: "Special Event Celebration",
    welcomeSubtext: "Making Memories Together",
    activeCeremony: "Grand Opening",
    categories: ["Highlights", "Moments", "Guests", "Celebration"],
    albums: [{ name: "Highlights", count: 50 }],
    decorationZones: ["Stage Area", "Welcome Area", "Dinner Zone"],
    timeline: [{ title: "Grand Opening", time: "06:00 PM", status: "LIVE" }],
  },
};

export default function MasterEventSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<
    "HERO" | "DECORATION" | "TIMELINE" | "FAMILY" | "MENU" | "QR"
  >("HERO");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Core States
  const [eventData, setEventData] = useState<any>(null);
  const [occasionType, setOccasionType] = useState("WEDDING");
  const [customOccasionName, setCustomOccasionName] = useState("");

  // Hero & Live
  const [heroTag, setHeroTag] = useState("LIVE EVENT");
  const [title, setTitle] = useState("A & S Wedding");
  const [subtitle, setSubtitle] = useState("Forever Begins Today");
  const [venueName, setVenueName] = useState("Jaipur Palace");
  const [activeCeremony, setActiveCeremony] = useState("Wedding Reception");
  const [ceremonyTime, setCeremonyTime] = useState("18:00");
  const [highlightUrl, setHighlightUrl] = useState("");
  const [storyVideoUrl, setStoryVideoUrl] = useState("");

  // Dynamic Lists (Add / Delete Enabled)
  const [categories, setCategories] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState("");

  const [decorationZones, setDecorationZones] = useState<string[]>([]);
  const [newDecorInput, setNewDecorInput] = useState("");

  const [albums, setAlbums] = useState<{ name: string; count: number }[]>([]);
  const [newAlbumInput, setNewAlbumInput] = useState("");

  const [timeline, setTimeline] = useState<
    { title: string; time: string; status: "UPCOMING" | "LIVE" | "COMPLETED" }[]
  >([]);
  const [newProgTitle, setNewProgTitle] = useState("");
  const [newProgTime, setNewProgTime] = useState("");

  // Food Menu
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [newFoodCategory, setNewFoodCategory] = useState("");

  // Family Members
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  const viewerBaseUrl =
    typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      ? "https://eventqr-live-viewer.vercel.app"
      : "http://localhost:3000";

  const liveViewerUrl = eventData?.slug ? `${viewerBaseUrl}/e/${eventData.slug}` : "";
  const qrCodeUrl = liveViewerUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
        liveViewerUrl
      )}`
    : "";

  // Template switch handler
  const handleApplyPreset = (typeKey: string) => {
    setOccasionType(typeKey);
    const cfg = OCCASION_PRESETS[typeKey] || OCCASION_PRESETS.CUSTOM;
    setHeroTag(cfg.heroTag);
    setTitle(cfg.welcomeHeading);
    setSubtitle(cfg.welcomeSubtext);
    setActiveCeremony(cfg.activeCeremony);
    setCategories([...cfg.categories]);
    setAlbums([...cfg.albums]);
    setDecorationZones([...cfg.decorationZones]);
    setTimeline([...cfg.timeline]);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/configure`, { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.event) {
        const ev = data.event;
        setEventData(ev);
        setTitle(ev.welcomeHeading || ev.title || "A & S Wedding");
        setSubtitle(ev.welcomeSubtext || "Forever Begins Today");
        setVenueName(ev.venueName || "Jaipur Palace");
        setHeroTag(ev.heroTag || "LIVE EVENT");
        setActiveCeremony(ev.activeCeremony || "Wedding Reception");
        setCeremonyTime(ev.ceremonyStartTime || "18:00");
        setHighlightUrl(ev.highlightUrl || "");
        setStoryVideoUrl(ev.storyVideoUrl || "");

        setCategories(ev.categories || OCCASION_PRESETS.WEDDING.categories);
        setAlbums(ev.albums || OCCASION_PRESETS.WEDDING.albums);
        setDecorationZones(ev.decorationZones || OCCASION_PRESETS.WEDDING.decorationZones);
        setTimeline(ev.timeline || OCCASION_PRESETS.WEDDING.timeline);

        setFamilyMembers([
          { id: "1", name: "Mr. Rajesh Sharma", role: "Bride's Father", side: "BRIDE" },
          { id: "2", name: "Mrs. Sunita Sharma", role: "Bride's Mother", side: "BRIDE" },
        ]);

        setFoodItems([
          { id: "1", category: "Welcome Drinks", name: "Fresh Lime Mojito", isVeg: true, isPopular: true },
          { id: "2", category: "Welcome Drinks", name: "Orange Mocktail", isVeg: true, isPopular: false },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save All
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
        highlightUrl,
        storyVideoUrl,
        type: occasionType === "CUSTOM" ? customOccasionName || "CUSTOM" : occasionType,
        categories: categories.map((c) => c.trim()).filter(Boolean),
        albums,
        decorationZones,
        timeline,
        foodItems,
        familyMembers,
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
        alert(data?.error || "Deployment failed");
      }
    } catch {
      alert("Network communication error");
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
      {/* Top Header */}
      <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-white">{title}</h1>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-400 border border-pink-500/30">
              STUDIO SUITE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Live Slug: /{eventData?.slug}</p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Deployed to Viewer!
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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#080c14] border border-slate-800 rounded-2xl">
        {[
          { id: "HERO", label: "Hero & Tracker", icon: Sparkles },
          { id: "DECORATION", label: "Decoration Albums (Video/Photo)", icon: Film },
          { id: "TIMELINE", label: "Event Timeline", icon: Clock },
          { id: "FAMILY", label: "Family Profiles", icon: Users },
          { id: "MENU", label: "Food & Drinks", icon: Utensils },
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

      {/* TAB 1: HERO & OCCASION */}
      {activeTab === "HERO" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" /> 1. Occasion, Banner & Ceremony Tracker
            </h2>
            <span className="text-xs text-slate-400">Select preset or customize anything</span>
          </div>

          {/* Presets Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "WEDDING", label: "💍 Wedding Celebration" },
              { id: "BIRTHDAY", label: "🎂 Birthday Party" },
              { id: "CORPORATE", label: "🏢 Corporate Summit" },
              { id: "CUSTOM", label: "✨ Custom Occasion" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className={`p-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  occasionType === p.id
                    ? "bg-pink-600/20 text-pink-400 border-pink-500/40"
                    : "bg-[#030712] text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {occasionType === "CUSTOM" && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-[11px] font-bold text-pink-400 uppercase">Your Occasion Name</label>
              <input
                type="text"
                value={customOccasionName}
                onChange={(e) => setCustomOccasionName(e.target.value)}
                placeholder="e.g. Sangeet Gala, Anniversary, Reunion"
                className="w-full bg-[#030712] border border-pink-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Top Badge (Hero Tag)</label>
              <input
                type="text"
                value={heroTag}
                onChange={(e) => setHeroTag(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Venue / Place</label>
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

          {/* Ceremony Countdown Tracker Box */}
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wide">
              Live Ceremony Tracker & Countdown Box
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Active Ceremony Name</label>
                <input
                  type="text"
                  value={activeCeremony}
                  onChange={(e) => setActiveCeremony(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Ceremony Start Time</label>
                <input
                  type="text"
                  value={ceremonyTime}
                  onChange={(e) => setCeremonyTime(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Video Action Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Watch Highlights Video URL</label>
              <input
                type="text"
                value={highlightUrl}
                onChange={(e) => setHighlightUrl(e.target.value)}
                placeholder="https://vimeo.com/... or https://youtube.com/..."
                className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Our Story Video URL</label>
              <input
                type="text"
                value={storyVideoUrl}
                onChange={(e) => setStoryVideoUrl(e.target.value)}
                placeholder="/story or media link"
                className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DECORATION & VIDEO ALBUMS */}
      {activeTab === "DECORATION" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-pink-400" /> Decoration Zones & Video Hub
              </h2>
              <p className="text-[11px] text-slate-400">
                Guests tap these cards to view exclusive decoration reels and photos.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-pink-400">
              {decorationZones.length} Zones
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add new decoration zone (e.g. Wedding Stage, Floral Mandap)..."
              value={newDecorInput}
              onChange={(e) => setNewDecorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newDecorInput.trim()) {
                  setDecorationZones([...decorationZones, newDecorInput.trim()]);
                  setNewDecorInput("");
                }
              }}
              className="flex-1 bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-pink-500"
            />
            <button
              type="button"
              onClick={() => {
                if (newDecorInput.trim()) {
                  setDecorationZones([...decorationZones, newDecorInput.trim()]);
                  setNewDecorInput("");
                }
              }}
              className="flex items-center gap-1.5 px-5 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Zone
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {decorationZones.map((zone, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-[#030712] border border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                    🌸
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">{zone}</span>
                    <span className="text-[10px] text-slate-500">Photos & Videos</span>
                  </div>
                </div>

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

          {/* Dynamic Photo/Video Categories Chips */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> Guest Gallery Filter Chips
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add filter chip (e.g. Ring Ceremony, Party)..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCatInput.trim()) {
                    setCategories([...categories, newCatInput.trim()]);
                    setNewCatInput("");
                  }
                }}
                className="flex-1 bg-[#030712] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCatInput.trim()) {
                    setCategories([...categories, newCatInput.trim()]);
                    setNewCatInput("");
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Chip
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <span className="font-semibold">{c}</span>
                  <button
                    type="button"
                    onClick={() => setCategories(categories.filter((_, idx) => idx !== i))}
                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EVENT TIMELINE */}
      {activeTab === "TIMELINE" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Live Ceremony Flow & Timeline
              </h2>
              <p className="text-[11px] text-slate-400">Click the badge to toggle LIVE / UPCOMING / COMPLETED.</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{timeline.length} Slots</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Ceremony Title (e.g. Haldi, Varmala, Dinner)"
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
                type="button"
                onClick={() => {
                  if (newProgTitle.trim()) {
                    setTimeline([
                      ...timeline,
                      { title: newProgTitle.trim(), time: newProgTime.trim() || "TBD", status: "UPCOMING" },
                    ]);
                    setNewProgTitle("");
                    setNewProgTime("");
                  }
                }}
                className="flex items-center justify-center px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {timeline.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 bg-[#030712] border border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                    {item.time}
                  </span>
                  <span className="font-bold text-white text-xs">{item.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTimeline(
                        timeline.map((it, idx) => {
                          if (idx !== i) return it;
                          const next =
                            it.status === "UPCOMING" ? "LIVE" : it.status === "LIVE" ? "COMPLETED" : "UPCOMING";
                          return { ...it, status: next };
                        })
                      );
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border cursor-pointer transition ${
                      item.status === "LIVE"
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                        : item.status === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {item.status}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeline(timeline.filter((_, idx) => idx !== i))}
                    className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FAMILY PROFILES */}
      {activeTab === "FAMILY" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" /> Bride & Groom Family Tree
              </h2>
              <p className="text-[11px] text-slate-400">Total {familyMembers.length} profiles configured.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFamilyMembers([
                  ...familyMembers,
                  { id: String(Date.now()), name: "Relative Name", role: "Brother / Sister", side: "BRIDE" },
                ]);
              }}
              className="flex items-center gap-1 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {familyMembers.map((member, idx) => (
              <div key={member.id || idx} className="p-4 bg-[#030712] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    Profile #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFamilyMembers(familyMembers.map((m, i) => (i === idx ? { ...m, name: val } : m)));
                    }}
                    placeholder="Full Name"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFamilyMembers(familyMembers.map((m, i) => (i === idx ? { ...m, role: val } : m)));
                    }}
                    placeholder="Relation / Role"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FOOD MENU */}
      {activeTab === "MENU" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" /> Food & Beverage Menu Builder
              </h2>
              <p className="text-[11px] text-slate-400">Total {foodItems.length} dishes created.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFoodItems([
                  ...foodItems,
                  {
                    id: String(Date.now()),
                    category: "Main Course",
                    name: "Signature Dish",
                    isVeg: true,
                    isPopular: false,
                  },
                ]);
              }}
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setFoodItems(foodItems.map((f, i) => (i === idx ? { ...f, name: val } : f)));
                    }}
                    className="bg-transparent font-bold text-xs text-white outline-none border-b border-dashed border-slate-700 w-2/3"
                  />
                  <button
                    type="button"
                    onClick={() => setFoodItems(foodItems.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFoodItems(foodItems.map((f, i) => (i === idx ? { ...f, isVeg: !f.isVeg } : f)));
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                      dish.isVeg
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {dish.isVeg ? "🌱 Veg" : "🍗 Non-Veg"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFoodItems(foodItems.map((f, i) => (i === idx ? { ...f, isPopular: !f.isPopular } : f)));
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                      dish.isPopular
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    ⭐ Popular
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: LIVE QR STUDIO */}
      {activeTab === "QR" && (
        <div className="p-6 md:p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6 text-center">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" /> Guest Entry QR Code Studio
          </h2>
          <p className="text-[11px] text-slate-400">
            Scanning this QR opens the live mobile viewer app for all guests.
          </p>

          <div className="bg-white p-6 rounded-2xl mx-auto w-fit shadow-2xl border border-slate-200">
            {qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCodeUrl} alt={`QR for ${title}`} className="w-56 h-56 mx-auto" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
            <p className="text-slate-900 font-black text-xs mt-3 tracking-wider uppercase">
              {title}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              {liveViewerUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 max-w-md mx-auto">
            {liveViewerUrl && (
              <a
                href={liveViewerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>Preview Mobile View</span>
              </a>
            )}

            {qrCodeUrl && (
              <a
                href={qrCodeUrl}
                download={`${eventData?.slug || "event"}-qr.png`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 flex-1 py-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-xl text-xs font-bold transition border border-emerald-500/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print QR</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}