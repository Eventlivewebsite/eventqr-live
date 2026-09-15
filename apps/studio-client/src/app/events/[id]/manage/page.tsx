"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Save,
  Tv,
  MapPin,
  Calendar,
  Palette,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Lock,
  Globe,
  Download,
  QrCode,
  AlertTriangle,
} from "lucide-react";

interface MasterEventSetupProps {
  params: Promise<{ id: string }>;
}

interface EventConfigState {
  name: string;
  slug: string;
  type: string;
  eventDate: string;
  isPublic: boolean;
  venueName: string;
  venueAddress: string;
  locationUrl: string;
  welcomeHeading: string;
  welcomeSubtext: string;
  themeColor: string;
  slideshowSpeedSeconds: number;
  moderationEnabled: boolean;
  allowVideoUploads: boolean;
  allowGuestDownloads: boolean;
  showQrOnScreen: boolean;
  isLive: boolean;
  status: string;
}

const INITIAL_DATA: EventConfigState = {
  name: "",
  slug: "",
  type: "WEDDING",
  eventDate: "",
  isPublic: true,
  venueName: "",
  venueAddress: "",
  locationUrl: "",
  welcomeHeading: "",
  welcomeSubtext: "",
  themeColor: "ROSE_GOLD",
  slideshowSpeedSeconds: 5,
  moderationEnabled: true,
  allowVideoUploads: false,
  allowGuestDownloads: true,
  showQrOnScreen: true,
  isLive: false,
  status: "APPROVED",
};

export default function MasterEventSetupPage({ params }: MasterEventSetupProps) {
  const resolvedParams = use(params);
  const rawId = resolvedParams?.id ? String(resolvedParams.id).trim() : "";
  const eventId = encodeURIComponent(rawId);

  const [formData, setFormData] = useState<EventConfigState>(INITIAL_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Helper Sanitizer
  const sanitizeText = (val: unknown): string => {
    if (typeof val !== "string") return "";
    return val.trim();
  };

  // Safe HTTP/HTTPS URL Validator
  const isValidUrl = (urlString: string): boolean => {
    if (!urlString.trim()) return true;
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const fetchConfig = useCallback(async () => {
    if (!eventId) {
      setErrorBanner("Invalid Event Identifier specified.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorBanner(null);

    try {
      const res = await fetch(`/api/events/${eventId}/configure`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json().catch(() => ({ success: false }));
      if (res.ok && data.success && data.event) {
        const ev = data.event;
        setFormData({
          name: sanitizeText(ev.name),
          slug: sanitizeText(ev.slug),
          type: sanitizeText(ev.type) || "WEDDING",
          eventDate: sanitizeText(ev.eventDate),
          isPublic: ev.isPublic ?? true,
          venueName: sanitizeText(ev.venueName),
          venueAddress: sanitizeText(ev.venueAddress),
          locationUrl: sanitizeText(ev.locationUrl),
          welcomeHeading: sanitizeText(ev.welcomeHeading),
          welcomeSubtext: sanitizeText(ev.welcomeSubtext),
          themeColor: sanitizeText(ev.themeColor) || "ROSE_GOLD",
          slideshowSpeedSeconds: Math.min(Math.max(Number(ev.slideshowSpeedSeconds) || 5, 2), 30),
          moderationEnabled: Boolean(ev.moderationEnabled),
          allowVideoUploads: Boolean(ev.allowVideoUploads),
          allowGuestDownloads: Boolean(ev.allowGuestDownloads),
          showQrOnScreen: Boolean(ev.showQrOnScreen),
          isLive: Boolean(ev.isLive),
          status: sanitizeText(ev.status) || "APPROVED",
        });
      } else {
        setErrorBanner(data.error || "Event setup configuration could not be loaded.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorBanner(`Failed to load event data: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessBanner(false);
    setErrorBanner(null);

    // Client-side Sanitization Checks
    if (!formData.name.trim()) {
      setErrorBanner("Event title cannot be left blank.");
      return;
    }

    if (formData.locationUrl.trim() && !isValidUrl(formData.locationUrl)) {
      setErrorBanner("Location link must be a valid URL starting with http:// or https://");
      return;
    }

    const cleanSpeed = Math.min(Math.max(Number(formData.slideshowSpeedSeconds) || 5, 2), 30);

    setSaving(true);

    try {
      const payload: EventConfigState = {
        name: sanitizeText(formData.name),
        slug: sanitizeText(formData.slug),
        type: sanitizeText(formData.type),
        eventDate: sanitizeText(formData.eventDate),
        isPublic: Boolean(formData.isPublic),
        venueName: sanitizeText(formData.venueName),
        venueAddress: sanitizeText(formData.venueAddress),
        locationUrl: sanitizeText(formData.locationUrl),
        welcomeHeading: sanitizeText(formData.welcomeHeading),
        welcomeSubtext: sanitizeText(formData.welcomeSubtext),
        themeColor: sanitizeText(formData.themeColor),
        slideshowSpeedSeconds: cleanSpeed,
        moderationEnabled: Boolean(formData.moderationEnabled),
        allowVideoUploads: Boolean(formData.allowVideoUploads),
        allowGuestDownloads: Boolean(formData.allowGuestDownloads),
        showQrOnScreen: Boolean(formData.showQrOnScreen),
        isLive: true,
        status: "APPROVED",
      };

      const res = await fetch(`/api/events/${eventId}/configure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json().catch(() => ({ success: false }));

      if (res.ok && data.success) {
        setSuccessBanner(true);
        setTimeout(() => setSuccessBanner(false), 4000);
      } else {
        setErrorBanner(data.error || "Failed to commit settings to server.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error";
      setErrorBanner(`Failed to save event parameters: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-3 text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <span className="text-xs font-mono">Synchronizing Event Master Console...</span>
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
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to My Live Events</span>
          </Link>

          <a
            href={`/viewer/${formData.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-pink-500/40 text-xs font-bold text-slate-200 hover:text-white rounded-2xl transition shadow-sm"
          >
            <Tv className="w-4 h-4 text-pink-400" />
            <span>Launch Viewer Screen</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>

        {/* Master Console Banner */}
        <div className="p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-white tracking-tight">
                Master Event &amp; Viewer Control Form
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AUTHORIZED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Complete setup parameters to configure the live big-screen feed, guest privacy, and upload rules.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-pink-500/20 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Finalize &amp; Deploy Event</span>
          </button>
        </div>

        {errorBanner && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {successBanner && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Configuration deployed successfully to the Big Screen Viewer!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group 1: Core Setup & Visibility */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-pink-400 border-b border-slate-800/80 pb-3">
              <Sparkles className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                1. Core Event Setup &amp; Privacy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Official Event Title</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Khan &amp; Fatima Grand Wedding"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-pink-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Occasion Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 cursor-pointer transition"
                >
                  <option value="WEDDING">💍 Wedding Ceremony</option>
                  <option value="RECEPTION">🥂 Grand Reception</option>
                  <option value="ANNIVERSARY">✨ Anniversary Gala</option>
                  <option value="BIRTHDAY">🎂 Birthday Bash</option>
                  <option value="CORPORATE">🏢 Corporate Conference</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Scheduled Date</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-pink-500 cursor-pointer transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Event Access / Privacy</label>
                <select
                  value={formData.isPublic ? "PUBLIC" : "PRIVATE"}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "PUBLIC" })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 cursor-pointer transition"
                >
                  <option value="PUBLIC">🌐 Public (Anyone with QR code can join &amp; view)</option>
                  <option value="PRIVATE">🔒 Private (Restricted gallery, upload moderation required)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Group 2: Venue & Location Navigation */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-sky-400 border-b border-slate-800/80 pb-3">
              <MapPin className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                2. Venue &amp; Navigation Coordinates
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Venue / Banquet Name</label>
                <input
                  type="text"
                  maxLength={150}
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  placeholder="e.g., The Heritage Hall, Grand Ballroom"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-sky-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Google Maps Direction Link</label>
                <input
                  type="url"
                  value={formData.locationUrl}
                  onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Viewer Big Screen Theme & Settings */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-purple-400 border-b border-slate-800/80 pb-3">
              <Palette className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                3. Big-Screen Projector Experience
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Display Welcome Headline</label>
                <input
                  type="text"
                  maxLength={120}
                  value={formData.welcomeHeading}
                  onChange={(e) => setFormData({ ...formData, welcomeHeading: e.target.value })}
                  placeholder="Welcome to Our Celebration"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Slideshow Transition Speed (Seconds)</label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={formData.slideshowSpeedSeconds}
                  onChange={(e) => setFormData({ ...formData, slideshowSpeedSeconds: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-300">Instruction Subtitle for Guests</label>
                <input
                  type="text"
                  maxLength={250}
                  value={formData.welcomeSubtext}
                  onChange={(e) => setFormData({ ...formData, welcomeSubtext: e.target.value })}
                  placeholder="Scan QR code from your table to broadcast your moments live!"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Display Color Palette</label>
                <select
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-purple-500 cursor-pointer transition"
                >
                  <option value="ROSE_GOLD">🌸 Rose Gold Luxury</option>
                  <option value="ROYAL_GOLD">👑 Royal Gold &amp; Obsidian</option>
                  <option value="CYBER_NEON">⚡ Cyber Neon &amp; Indigo</option>
                  <option value="EMERALD_NIGHT">🍃 Emerald Garden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Group 4: Interaction Rules & Permissions */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800/80 pb-3">
              <ShieldCheck className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                4. Interaction Rules &amp; Moderation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition">
                <div>
                  <span className="font-bold text-white block">Pre-Approval Gate</span>
                  <span className="text-slate-500 text-[11px]">Require admin confirmation before displaying on wall</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.moderationEnabled}
                  onChange={(e) => setFormData({ ...formData, moderationEnabled: e.target.checked })}
                  className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition">
                <div>
                  <span className="font-bold text-white block">Show Corner QR Code</span>
                  <span className="text-slate-500 text-[11px]">Overlay QR on big screen for late arrivals</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showQrOnScreen}
                  onChange={(e) => setFormData({ ...formData, showQrOnScreen: e.target.checked })}
                  className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition">
                <div>
                  <span className="font-bold text-white block">Guest Photo Downloads</span>
                  <span className="text-slate-500 text-[11px]">Allow guests to save high-res copies from gallery</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowGuestDownloads}
                  onChange={(e) => setFormData({ ...formData, allowGuestDownloads: e.target.checked })}
                  className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition">
                <div>
                  <span className="font-bold text-white block">Allow 15s Video Wishes</span>
                  <span className="text-slate-500 text-[11px]">Permit short recorded video submissions</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowVideoUploads}
                  onChange={(e) => setFormData({ ...formData, allowVideoUploads: e.target.checked })}
                  className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white rounded-2xl text-xs font-black transition shadow-xl shadow-pink-500/25 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Finalize &amp; Deploy Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}