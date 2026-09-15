"use client";

import React, { useState, useEffect } from "react";
import { 
  Radio, Shield, Download, Image as ImageIcon, 
  Eye, EyeOff, Trash2, Lock, Unlock, CheckCircle2, 
  Loader2, RefreshCw, QrCode, Sliders, Palette
} from "lucide-react";

export default function ViewerControlsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form States
  const [isLive, setIsLive] = useState(true);
  const [qrEnabled, setQrEnabled] = useState(true);
  const [allowGuestUpload, setAllowGuestUpload] = useState(true);
  const [guestBook, setGuestBook] = useState(true);
  const [accessMode, setAccessMode] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [pinCode, setPinCode] = useState("");
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState("");
  const [themeColor, setThemeColor] = useState("#ec4899");

  // Fetch all events of client
  const loadEvents = async () => {
    try {
      setLoading(true);
      const session = localStorage.getItem("studio_client_session");
      const client = session ? JSON.parse(session) : null;
      const clientId = client?.id || "";

      const res = await fetch(`/api/events?clientId=${clientId}`);
      const data = await res.json();
      if (data.success && data.events?.length > 0) {
        setEvents(data.events);
        setSelectedEventId(data.events[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Load specific event viewer settings
  const loadEventSettings = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/viewer-controls?eventId=${id}`);
      const data = await res.json();
      if (data.success && data.event) {
        const ev = data.event;
        setEventData(ev);
        setIsLive(ev.isLive);
        setQrEnabled(ev.qrEnabled);
        setAllowGuestUpload(ev.allowGuestUpload);
        setGuestBook(ev.guestBook);
        setAccessMode(ev.accessMode);
        setPinCode(ev.pinCode || "");
        setThemeColor(ev.themeColor || "#ec4899");
        if (ev.settings) {
          setAllowDownloads(ev.settings.allowDownloads);
          setShowWatermark(ev.settings.showWatermark);
          setWatermarkText(ev.settings.watermarkText || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventSettings(selectedEventId);
    }
  }, [selectedEventId]);

  // Save Settings
  const handleSaveControls = async () => {
    if (!selectedEventId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/viewer-controls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          isLive,
          qrEnabled,
          allowGuestUpload,
          guestBook,
          accessMode,
          pinCode,
          themeColor,
          allowDownloads,
          showWatermark,
          watermarkText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Viewer settings updated live on guest screens!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (e: any) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Photo Moderation Toggle
  const handleTogglePhotoModeration = async (mediaId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/viewer-controls", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          isApproved: !currentStatus,
        }),
      });
      if (res.ok) {
        loadEventSettings(selectedEventId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Soft Delete Photo
  const handleDeletePhoto = async (mediaId: string) => {
    if (!confirm("Are you sure you want to remove this photo from viewer screen?")) return;
    try {
      const res = await fetch("/api/viewer-controls", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          isDeleted: true,
        }),
      });
      if (res.ok) {
        loadEventSettings(selectedEventId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#030712] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 bg-[#0b0f19] border border-slate-800 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${isLive ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
            <h1 className="text-2xl font-black text-white tracking-tight">Viewer Side Live Command Center</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Control guest display features, watermarks, security locks, and live feed in real-time.
          </p>
        </div>

        {events.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-pink-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.slug})
                </option>
              ))}
            </select>

            <button
              onClick={handleSaveControls}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-pink-600/30 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Save Live Changes</span>
            </button>
          </div>
        )}
      </div>

      {loading && !eventData ? (
        <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" /> Syncing with event viewer...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Status Card */}
            <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-500" /> Core Viewer Switches
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Is Live Switch */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Event Broadcast (isLive)</p>
                    <p className="text-[11px] text-slate-400">If OFF, viewers will see &apos;Coming Soon&apos;</p>
                  </div>
                  <button
                    onClick={() => setIsLive(!isLive)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      isLive ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        isLive ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* QR Access Switch */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">QR Code Direct Access</p>
                    <p className="text-[11px] text-slate-400">Allow table standee scans</p>
                  </div>
                  <button
                    onClick={() => setQrEnabled(!qrEnabled)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      qrEnabled ? "bg-pink-600" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        qrEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Guest Upload Switch */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Guest Live Upload</p>
                    <p className="text-[11px] text-slate-400">Let wedding guests upload selfies</p>
                  </div>
                  <button
                    onClick={() => setAllowGuestUpload(!allowGuestUpload)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      allowGuestUpload ? "bg-pink-600" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        allowGuestUpload ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Download Switch */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Viewer Downloads</p>
                    <p className="text-[11px] text-slate-400">Allow guests to save high-res media</p>
                  </div>
                  <button
                    onClick={() => setAllowDownloads(!allowDownloads)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      allowDownloads ? "bg-pink-600" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        allowDownloads ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Watermark & Branding Card */}
            <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" /> Watermark & Studio Branding
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-white">Apply Watermark on Guest Screen</p>
                    <p className="text-[11px] text-slate-400">Protects studio photos from unauthorized reuse</p>
                  </div>
                  <button
                    onClick={() => setShowWatermark(!showWatermark)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      showWatermark ? "bg-indigo-600" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        showWatermark ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {showWatermark && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Watermark Display Text / Studio Signature
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. Captured by Royal Wedding Studio"
                      className="w-full bg-[#030712] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Live Feed Moderation */}
            <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Live Feed Moderation
                </h2>
                <span className="text-xs text-slate-500">
                  {eventData?.albums?.[0]?.media?.length || 0} Media items
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Click on the Eye button to instantly hide/unhide any photo from the guest viewer screen.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
                {eventData?.albums?.flatMap((alb: any) =>
                  alb.media.map((item: any) => (
                    <div
                      key={item.id}
                      className={`relative group rounded-2xl overflow-hidden border ${
                        item.isApproved
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-red-500/50 bg-red-950/20"
                      }`}
                    >
                      <div className="aspect-square bg-slate-950 flex items-center justify-center relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnailPath || item.originalPath}
                          alt="Feed photo"
                          className="w-full h-full object-cover"
                        />
                        {!item.isApproved && (
                          <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center text-[10px] font-bold text-red-300 uppercase">
                            Hidden from Viewers
                          </div>
                        )}
                      </div>

                      <div className="p-2 flex items-center justify-between bg-slate-950/80">
                        <button
                          onClick={() => handleTogglePhotoModeration(item.id, item.isApproved)}
                          className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                            item.isApproved
                              ? "bg-slate-800 text-slate-300 hover:text-white"
                              : "bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50"
                          }`}
                          title={item.isApproved ? "Hide from guests" : "Show to guests"}
                        >
                          {item.isApproved ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDeletePhoto(item.id)}
                          className="p-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg transition cursor-pointer"
                          title="Delete photo completely"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Settings: Security & QR View */}
          <div className="space-y-6">
            {/* Viewer Security Lock */}
            <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> Viewer Access Mode
              </h2>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAccessMode("PUBLIC")}
                    className={`w-1/2 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      accessMode === "PUBLIC"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    Public (Open)
                  </button>
                  <button
                    onClick={() => setAccessMode("PRIVATE")}
                    className={`w-1/2 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      accessMode === "PRIVATE"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    PIN Protected
                  </button>
                </div>

                {accessMode === "PRIVATE" && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      4-Digit Event PIN
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="e.g. 2026"
                      className="w-full bg-[#030712] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Viewer Theme Color */}
            <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-500" /> Viewer Theme Color
              </h2>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-300 uppercase font-bold">{themeColor}</span>
              </div>
            </div>

            {/* Live QR Standee Preview Link */}
            <div className="p-6 bg-gradient-to-br from-pink-950/30 to-purple-950/20 border border-pink-500/20 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-pink-400">
                <QrCode className="w-5 h-5" />
                <h3 className="text-xs font-black uppercase tracking-wider">Viewer Live URL</h3>
              </div>

              <div className="p-3 bg-black/40 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 break-all">
                {typeof window !== "undefined" ? window.location.origin.replace(":3002", ":3000") : ""}/event/{eventData?.slug}
              </div>

              <a
                href={`http://localhost:3000/event/${eventData?.slug}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs text-center transition cursor-pointer shadow-lg shadow-pink-600/20"
              >
                Open Viewer Screen ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}