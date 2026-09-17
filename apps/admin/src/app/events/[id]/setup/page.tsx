"use client";

import React, { useState, useEffect, use } from "react";
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
  CheckCircle2,
} from "lucide-react";

export default function EventSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [eventData, setEventData] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState("");

  const viewerBaseUrl =
    typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      ? "https://eventqr-live-viewer.vercel.app"
      : "http://localhost:3000";

  const liveViewerUrl = eventData?.slug ? `${viewerBaseUrl}/e/${eventData.slug}` : "";
  const qrCodeUrl = liveViewerUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        liveViewerUrl
      )}`
    : "";

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${eventId}/configure`);
        const data = await res.json();
        if (data.success && data.event) {
          setEventData(data.event);
          setTitle(data.event.title || "");
          setSubtitle(data.event.settings?.subtitle || "Forever Begins Today");

          if (data.event.albums && data.event.albums.length > 0) {
            setCategories(data.event.albums.map((a: any) => a.title));
          } else {
            setCategories(["Ceremony", "Haldi", "Mehendi", "Reception"]);
          }
        }
      } catch (err) {
        console.error("Failed to load event configuration", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    if (!categories.includes(newCatInput.trim())) {
      setCategories([...categories, newCatInput.trim()]);
    }
    setNewCatInput("");
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);
      const res = await fetch(`/api/events/${eventId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          categories,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Failed to save: " + data.error);
      }
    } catch {
      alert("Error saving event settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        <span className="text-sm font-mono">Loading Event Configuration...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Events
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">{eventData?.title || "Event Setup"}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {eventData?.status || "ACTIVE"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Slug: /{eventData?.slug}</p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Changes Saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-pink-500/20 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Customization</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Event Settings & Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" /> Event Details & Hero Text
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Subtitle / Caption</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Categories Management */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" /> Gallery Categories (Albums)
                </h2>
                <p className="text-xs text-slate-400">Add, rename, or delete guest gallery categories.</p>
              </div>
            </div>

            {/* Add Category Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Category Name (e.g. Haldi, Dinner)"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Categories List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl"
                >
                  <span className="font-semibold text-sm text-slate-200">{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Code & Viewer Link */}
        <div className="space-y-6">
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-6 text-center">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" /> Live Guest Access QR
              </h2>
              <p className="text-xs text-slate-400">Guests scan this QR to view and upload pictures directly.</p>
            </div>

            {/* QR Card */}
            <div className="bg-white p-6 rounded-2xl mx-auto w-fit shadow-2xl shadow-emerald-500/10 border border-slate-200">
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${eventData?.title}`}
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
              <p className="text-slate-900 font-black text-xs mt-3 tracking-wider uppercase">
                {eventData?.title}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {liveViewerUrl && (
                <a
                  href={liveViewerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Open Viewer Experience</span>
                </a>
              )}

              {qrCodeUrl && (
                <a
                  href={qrCodeUrl}
                  download={`${eventData?.slug}-qr.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition border border-emerald-500/20"
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