"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Save,
  Tv,
  MapPin,
  Calendar,
  Clock,
  Palette,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Plus,
  Trash2,
  Layers,
  Tag,
  ListOrdered,
  Menu,
  Sparkle,
  Eye,
} from "lucide-react";

// PRESET TEMPLATES FOR DIFFERENT OCCASIONS
const TEMPLATE_CONFIGS: Record<string, any> = {
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
    timeline: [
      { title: "Haldi Ceremony", time: "11:00 AM", status: "COMPLETED" },
      { title: "Wedding Reception", time: "06:00 PM", status: "LIVE" },
      { title: "Dinner", time: "08:00 PM", status: "UPCOMING" },
    ],
    menuItems: ["Premium Invitation", "Family & VIPs", "Guest Book", "Food Menu", "Settings"],
    decorationZones: ["Wedding Stage", "Floral Decoration", "Lighting", "Entrance", "Dining", "Selfie Booth"],
  },
  CORPORATE: {
    heroTag: "ANNUAL SUMMIT LIVE",
    welcomeHeading: "Global Tech Leadership Summit 2026",
    welcomeSubtext: "Innovate, Lead, Transform",
    activeCeremony: "Keynote Address",
    categories: ["Keynote", "Workshops", "Hackathon", "Awards", "Networking", "Dinner"],
    albums: [
      { name: "Executive Keynote", count: 95 },
      { name: "Team Innovation", count: 140 },
      { name: "Awards Gala", count: 180 },
    ],
    timeline: [
      { title: "Morning Registration", time: "09:00 AM", status: "COMPLETED" },
      { title: "Keynote Address", time: "10:30 AM", status: "LIVE" },
      { title: "Awards & Dinner", time: "07:00 PM", status: "UPCOMING" },
    ],
    menuItems: ["Event Agenda", "Key Speakers", "Live Q&A", "Sponsors", "Venue Map"],
    decorationZones: ["Main Stage", "Exhibition Area", "Registration Lounge", "VIP Lounge"],
  },
  BIRTHDAY: {
    heroTag: "BIRTHDAY BASH",
    welcomeHeading: "Aarav's 1st Birthday Fiesta",
    welcomeSubtext: "One Year of Pure Joy",
    activeCeremony: "Cake Cutting Ceremony",
    categories: ["Cake Cutting", "Games & Magic", "Family Portraits", "Gifts & Fun", "Dance"],
    albums: [
      { name: "Cake Cutting", count: 65 },
      { name: "Kids Zone", count: 110 },
      { name: "Party Highlights", count: 145 },
    ],
    timeline: [
      { title: "Guest Arrival & Magic Show", time: "05:00 PM", status: "COMPLETED" },
      { title: "Cake Cutting Ceremony", time: "07:00 PM", status: "LIVE" },
      { title: "Dinner & Dance", time: "08:30 PM", status: "UPCOMING" },
    ],
    menuItems: ["Birthday Wishes", "Photo Booth", "Menu Special", "Party Games"],
    decorationZones: ["Theme Balloon Stage", "Kids Play Zone", "Selfie Backdrop", "Buffet Area"],
  },
  ANNIVERSARY: {
    heroTag: "SILVER JUBILEE",
    welcomeHeading: "25 Years of Togetherness",
    welcomeSubtext: "Love, Memories & Celebration",
    activeCeremony: "Ring Exchange & Toast",
    categories: ["Ceremony", "Nostalgia Photos", "Toasts & Wishes", "Dinner & Music"],
    albums: [
      { name: "Grand Entrance", count: 80 },
      { name: "Family & Friends", count: 130 },
      { name: "Dinner Gala", count: 90 },
    ],
    timeline: [
      { title: "Welcome Drinks", time: "06:30 PM", status: "COMPLETED" },
      { title: "Ring Exchange & Toast", time: "08:00 PM", status: "LIVE" },
      { title: "Celebration Dinner", time: "09:30 PM", status: "UPCOMING" },
    ],
    menuItems: ["Couple Journey", "Wishes Board", "Dinner Menu", "Settings"],
    decorationZones: ["Couples Stage", "Photo Memory Lane", "Dining Hall"],
  },
};

export default function AdminEventSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams?.id ? String(resolvedParams.id).trim() : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "WEDDING",
    eventDate: "",
    venueName: "Jaipur Palace",
    locationUrl: "",
    heroTag: "LIVE EVENT",
    welcomeHeading: "A & S Wedding",
    welcomeSubtext: "Forever Begins Today",
    activeCeremony: "Wedding Reception",
    ceremonyStartTime: "18:00",
    themeColor: "ROSE_GOLD",
    categories: [] as string[],
    albums: [] as { name: string; count: number }[],
    timeline: [] as { title: string; time: string; status: string }[],
    menuItems: [] as string[],
    decorationZones: [] as string[],
  });

  const [newCatInput, setNewCatInput] = useState("");
  const [newAlbumInput, setNewAlbumInput] = useState("");
  const [newTimelineTitle, setNewTimelineTitle] = useState("");
  const [newTimelineTime, setNewTimelineTime] = useState("");
  const [newTimelineStatus, setNewTimelineStatus] = useState("UPCOMING");

  const loadEvent = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/events/${eventId}/configure`, { cache: "no-store" });
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid HTML page. API endpoint verify karein.");
      }

      if (json.success && json.event) {
        const ev = json.event;
        const currentType = (ev.type || "WEDDING").toUpperCase();
        const preset = TEMPLATE_CONFIGS[currentType] || TEMPLATE_CONFIGS.WEDDING;

        setFormData({
          name: ev.name || preset.welcomeHeading,
          slug: ev.slug,
          type: currentType,
          eventDate: ev.eventDate || "",
          venueName: ev.venueName || "Jaipur Palace",
          locationUrl: ev.locationUrl || "",
          heroTag: ev.heroTag || preset.heroTag,
          welcomeHeading: ev.welcomeHeading || preset.welcomeHeading,
          welcomeSubtext: ev.welcomeSubtext || preset.welcomeSubtext,
          activeCeremony: ev.activeCeremony || preset.activeCeremony,
          ceremonyStartTime: ev.ceremonyStartTime || "18:00",
          themeColor: ev.themeColor || "ROSE_GOLD",
          categories: ev.categories && ev.categories.length > 0 ? ev.categories : preset.categories,
          albums: ev.albums && ev.albums.length > 0 ? ev.albums : preset.albums,
          timeline: ev.timeline && ev.timeline.length > 0 ? ev.timeline : preset.timeline,
          menuItems: ev.menuItems && ev.menuItems.length > 0 ? ev.menuItems : preset.menuItems,
          decorationZones: ev.decorationZones && ev.decorationZones.length > 0 ? ev.decorationZones : preset.decorationZones,
        });
      } else {
        setErrorMsg(json.error || "Event data could not be retrieved.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load configuration.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  // When Occasion Type changes, switch template presets
  const handleTypeChange = (newType: string) => {
    const preset = TEMPLATE_CONFIGS[newType] || TEMPLATE_CONFIGS.WEDDING;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      heroTag: preset.heroTag,
      welcomeHeading: preset.welcomeHeading,
      welcomeSubtext: preset.welcomeSubtext,
      activeCeremony: preset.activeCeremony,
      categories: preset.categories,
      albums: preset.albums,
      timeline: preset.timeline,
      menuItems: preset.menuItems,
      decorationZones: preset.decorationZones,
    }));
  };

  // Add/Remove Category
  const addCategory = () => {
    if (!newCatInput.trim()) return;
    if (formData.categories.includes(newCatInput.trim())) return;
    setFormData({ ...formData, categories: [...formData.categories, newCatInput.trim()] });
    setNewCatInput("");
  };

  const removeCategory = (cat: string) => {
    setFormData({ ...formData, categories: formData.categories.filter((c) => c !== cat) });
  };

  // Add/Remove Album
  const addAlbum = () => {
    if (!newAlbumInput.trim()) return;
    setFormData({
      ...formData,
      albums: [...formData.albums, { name: newAlbumInput.trim(), count: 0 }],
    });
    setNewAlbumInput("");
  };

  const removeAlbum = (idx: number) => {
    setFormData({
      ...formData,
      albums: formData.albums.filter((_, i) => i !== idx),
    });
  };

  // Add/Remove Timeline Item
  const addTimelineItem = () => {
    if (!newTimelineTitle.trim() || !newTimelineTime.trim()) return;
    setFormData({
      ...formData,
      timeline: [
        ...formData.timeline,
        {
          title: newTimelineTitle.trim(),
          time: newTimelineTime.trim(),
          status: newTimelineStatus,
        },
      ],
    });
    setNewTimelineTitle("");
    setNewTimelineTime("");
  };

  const removeTimelineItem = (idx: number) => {
    setFormData({
      ...formData,
      timeline: formData.timeline.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/events/${eventId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Invalid response received from server.");
      }

      if (res.ok && json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg(json.error || "Failed to commit configuration.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-3 text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <span className="text-xs font-mono">Synchronizing Event &amp; Viewer Engine...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-8 font-sans selection:bg-pink-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Live Events</span>
          </Link>

          <a
            href={`http://localhost:3000/e/${formData.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-pink-500/40 text-xs font-bold text-slate-200 hover:text-white rounded-2xl transition shadow-lg shadow-pink-500/5"
          >
            <Tv className="w-4 h-4 text-pink-400" />
            <span>Open Mobile &amp; TV Viewer Screen</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>

        {/* Console Header */}
        <div className="p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-white tracking-tight">
                Master Viewer &amp; App Customizer
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                ACTIVE SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Customize banners, ceremony countdowns, albums, categories, and timeline elements in real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white rounded-2xl text-xs font-black transition shadow-xl shadow-pink-500/25 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save &amp; Update Viewer Screen</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Viewer screens updated successfully! Refresh your mobile/projector screen to see live changes.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Event Type & Occasion Switcher */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-pink-400 border-b border-slate-800/80 pb-3">
              <Sparkles className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                1. Event Occasion &amp; Master Template
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Event Occasion Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="WEDDING">💍 Wedding Ceremony (Haldi, Mehendi, Sangeet, Reception)</option>
                  <option value="CORPORATE">🏢 Corporate Summit (Keynotes, Hackathons, Awards)</option>
                  <option value="BIRTHDAY">🎂 Birthday Bash (Cake Cutting, Kids Zone, Games)</option>
                  <option value="ANNIVERSARY">✨ Anniversary Celebration (Toasts, Memory Lane)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">
                  Switching occasion will pre-fill categories, timeline, and albums automatically.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Display Theme Palette</label>
                <select
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="ROSE_GOLD">🌸 Rose Gold &amp; Warm Amber (Wedding Luxury)</option>
                  <option value="ROYAL_GOLD">👑 Royal Gold &amp; Deep Obsidian</option>
                  <option value="CYBER_NEON">⚡ Cyber Indigo (Corporate Modern)</option>
                  <option value="EMERALD_NIGHT">🍃 Emerald Garden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Viewer Hero Card Customization */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-sky-400 border-b border-slate-800/80 pb-3">
              <Tv className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                2. Viewer Hero Banner &amp; Live Ceremony Tracker
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Hero Main Title (e.g. A &amp; S Wedding)</label>
                <input
                  type="text"
                  value={formData.welcomeHeading}
                  onChange={(e) => setFormData({ ...formData, welcomeHeading: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Subtitle / Tagline (e.g. Forever Begins Today)</label>
                <input
                  type="text"
                  value={formData.welcomeSubtext}
                  onChange={(e) => setFormData({ ...formData, welcomeSubtext: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Venue / Location Name</label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Currently Active Ceremony / Sub-Event</label>
                <input
                  type="text"
                  value={formData.activeCeremony}
                  onChange={(e) => setFormData({ ...formData, activeCeremony: e.target.value })}
                  placeholder="e.g. Wedding Reception"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Category Chips Manager */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Tag className="w-4 h-4" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  3. Category Filter Chips (Screenshots 3 &amp; 5)
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {formData.categories.length} Active Chips
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="Add custom chip (e.g. Sangeet, Awards, Stage)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Chip</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Dynamic Albums Manager */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Layers className="w-4 h-4" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  4. Albums Cards (Screenshot 2)
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {formData.albums.length} Album Cards
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAlbumInput}
                onChange={(e) => setNewAlbumInput(e.target.value)}
                placeholder="Add Album (e.g. Haldi, Keynote, Stage)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addAlbum}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Album</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {formData.albums.map((album, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{album.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{album.count} Media items</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAlbum(idx)}
                    className="text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Event Timeline Tracker Manager */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ListOrdered className="w-4 h-4" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  5. Event Timeline &amp; Program Schedule (Screenshot 3)
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {formData.timeline.length} Program Milestones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                value={newTimelineTitle}
                onChange={(e) => setNewTimelineTitle(e.target.value)}
                placeholder="Title (e.g. Wedding Reception)"
                className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={newTimelineTime}
                onChange={(e) => setNewTimelineTime(e.target.value)}
                placeholder="Time (e.g. 06:00 PM)"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addTimelineItem}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Program</span>
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {formData.timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === "LIVE"
                          ? "bg-rose-500 animate-ping"
                          : item.status === "COMPLETED"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{item.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => {
                        const updated = [...formData.timeline];
                        updated[idx].status = e.target.value;
                        setFormData({ ...formData, timeline: updated });
                      }}
                      className="bg-slate-950 border border-slate-800 text-[10px] font-bold rounded-lg px-2 py-1 text-slate-300 outline-none"
                    >
                      <option value="LIVE">🔴 LIVE</option>
                      <option value="UPCOMING">🟠 UPCOMING</option>
                      <option value="COMPLETED">🟢 COMPLETED</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeTimelineItem(idx)}
                      className="text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Trigger */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white rounded-2xl text-xs font-black transition shadow-xl shadow-pink-500/25 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Deploy to Viewer Feed</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}