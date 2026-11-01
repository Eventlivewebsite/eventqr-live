"use client";

import React, { useState, useEffect } from "react";
import { 
  Image as ImageIcon, Film, Upload, Trash2, Loader2, 
  Sparkles, CheckCircle2, ChevronDown, FolderOpen, ExternalLink,
  Filter, Eye, Check, Send, Zap
} from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  type: "photo" | "video";
  section: "Category" | "Decoration";
  category: string;
  createdAt: string;
}

// Client-side auto canvas compression
async function autoCompressFile(file: File): Promise<string> {
  if (file.type.startsWith("video/")) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(img.src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/webp", 0.82);
        resolve(compressedBase64);
      };
      img.onerror = () => resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function MediaStudioPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingEventData, setLoadingEventData] = useState(false);
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");

  const [availableTargets, setAvailableTargets] = useState<{ section: "Category" | "Decoration"; name: string }[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [mediaVault, setMediaVault] = useState<MediaItem[]>([]);
  const [filterTarget, setFilterTarget] = useState<string>("ALL");

  const [isUploading, setIsUploading] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);

  // Broadcast zero-reload instant sync
  const triggerLivePush = () => {
    if (typeof window !== "undefined") {
      try {
        const channel = new BroadcastChannel("event_media_sync");
        channel.postMessage({
          type: "MEDIA_UPLOADED",
          eventId: selectedEventId,
          timestamp: Date.now(),
        });
        channel.close();
      } catch (e) {
        console.error("BroadcastChannel sync error:", e);
      }
    }
    setPushSuccess(true);
    setTimeout(() => setPushSuccess(false), 2500);
  };

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoadingEvents(true);
        const res = await fetch("/api/events?activeOnly=true");
        const json = await res.json();
        if (json.success && Array.isArray(json.events) && json.events.length > 0) {
          setEvents(json.events);
          setSelectedEventId(json.events[0].id);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;

    async function loadEventMedia() {
      try {
        setLoadingEventData(true);
        const res = await fetch("/api/events/" + selectedEventId + "/configure");
        const json = await res.json();
        if (json.success && json.event) {
          const cm = json.event.customMap || {};
          const targets: { section: "Category" | "Decoration"; name: string }[] = [];

          const parseSafe = (val: any) => {
            if (Array.isArray(val)) return val;
            if (typeof val === "string") {
              try {
                const p = JSON.parse(val);
                if (Array.isArray(p)) return p;
              } catch {}
            }
            return [];
          };

          // 1. ONLY Photo & Video Categories
          const cats = [
            ...parseSafe(cm.photoCategories),
            ...parseSafe(cm.videoCategories),
            ...parseSafe(cm.categoriesList),
          ];
          const uniqueCats = Array.from(
            new Set(
              cats
                .map((c: any) => (typeof c === "string" ? c : c.name || c.title || ""))
                .filter(Boolean)
            )
          );
          
          if (uniqueCats.length > 0) {
            uniqueCats.forEach((c) => targets.push({ section: "Category", name: c }));
          } else {
            ["Ceremony", "Stage", "Celebrations", "Reception"].forEach((c) =>
              targets.push({ section: "Category", name: c })
            );
          }

          // 2. ONLY Decoration Albums
          const decors = [
            ...parseSafe(cm.decorationItems),
            ...parseSafe(cm.photoDecorationCategories),
            ...parseSafe(cm.videoDecorationCategories),
          ];
          const uniqueDecors = Array.from(
            new Set(
              decors
                .map((d: any) => (typeof d === "string" ? d : d.name || d.title || ""))
                .filter(Boolean)
            )
          );
          
          if (uniqueDecors.length > 0) {
            uniqueDecors.forEach((d) => targets.push({ section: "Decoration", name: d }));
          } else {
            ["Main Stage", "Entrance Gate", "Floral Decor", "Lighting Setup"].forEach((d) =>
              targets.push({ section: "Decoration", name: d })
            );
          }

          // Strictly filter out any other sections (Food, Family, Hero omitted)
          setAvailableTargets(targets);
          if (targets.length > 0) {
            setSelectedTarget(targets[0].section + ":" + targets[0].name);
          }

          // Load vault media
          const vault = parseSafe(cm.mediaVault);
          setMediaVault(vault);
        }
      } catch (err) {
        console.error("Failed to load event media:", err);
      } finally {
        setLoadingEventData(false);
      }
    }

    loadEventMedia();
  }, [selectedEventId]);

    const handlePushToViewer = async () => {
    try {
      if (!selectedEventId) {
        alert("Please select an active event first.");
        return;
      }
      
      const payload = {
        type: "EVENT_MEDIA_SYNC",
        eventId: selectedEventId,
        timestamp: Date.now()
      };

      if (typeof window !== "undefined") {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("event_media_sync");
          bc.postMessage(payload);
          setTimeout(() => bc.close(), 1000);
        }
        localStorage.setItem("eventqr_media_push_trigger", JSON.stringify(payload));
      }
      alert("Pushed to Live Viewer successfully!");
    } catch (e) {
      console.error("Push error:", e);
    }
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedTarget) return;
    setIsUploading(true);

    try {
      const parts = selectedTarget.split(":");
      const sec = parts[0] as "Category" | "Decoration";
      const name = parts[1];
      const newItems: MediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVid = file.type.startsWith("video/");
        const base64Uri = await autoCompressFile(file);

        newItems.push({
          id: Date.now() + "-" + Math.random().toString(36).substring(2, 8),
          url: base64Uri,
          type: isVid ? "video" : "photo",
          section: sec,
          category: name,
          createdAt: new Date().toISOString(),
        });
      }

      const updatedVault = [...newItems, ...mediaVault];
      setMediaVault(updatedVault);

      await fetch("/api/events/" + selectedEventId + "/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaVault: updatedVault }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      // Instant push sync
      triggerLivePush();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const updatedVault = mediaVault.filter((m) => m.id !== id);
    setMediaVault(updatedVault);

    try {
      await fetch("/api/events/" + selectedEventId + "/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaVault: updatedVault }),
      });
      triggerLivePush();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredVault = mediaVault.filter((item) => {
    const matchesType = activeTab === "photos" ? item.type === "photo" : item.type === "video";
    const matchesTarget = filterTarget === "ALL" || (item.section + ":" + item.category) === filterTarget;
    return matchesType && matchesTarget;
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-stone-200 p-6 md:p-10 font-sans">
      
      {/* Top Suite Bar */}
      <div className="mx-auto max-w-7xl rounded-3xl border border-stone-800/80 bg-stone-900/60 p-6 backdrop-blur-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="text-amber-400" size={22} />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Media Studio & Publishing Suite
            </h1>
          </div>
          <p className="mt-1 text-xs md:text-sm text-stone-400">
            Auto-compress media and route strictly to Category &amp; Decoration targets with zero-refresh live push.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Push Live Button */}
          <button
            onClick={triggerLivePush}
            disabled={isPushing}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-rose-600/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <Zap size={15} className="fill-white" />
            <span>{pushSuccess ? "Pushed to Guests!" : "Push to Live Viewer"}</span>
          </button>

          {/* Active Event Selector */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-2xl border border-stone-700 bg-stone-800/90 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.eventType || "EVENT"})
              </option>
            ))}
          </select>

          {selectedEvent && (
            <a
              href={"https://eventqr-live-viewer.vercel.app/?slug=" + selectedEvent.slug}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-2xl border border-stone-700 bg-stone-800/80 px-3.5 py-2.5 text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-700 transition"
            >
              <span>Live Viewer</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Main Grid: Upload Router (Left) & Vault Gallery (Right) */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Upload Router & Compressor */}
        <div className="lg:col-span-5 rounded-3xl border border-stone-800/90 bg-stone-900/50 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FolderOpen className="text-amber-400" size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Upload Router &amp; Compressor
                </h3>
              </div>

              {/* Photos / Videos Toggle */}
              <div className="flex rounded-xl bg-stone-800 p-1 border border-stone-700/60">
                <button
                  onClick={() => setActiveTab("photos")}
                  className={
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition " +
                    (activeTab === "photos" ? "bg-amber-400 text-stone-950 shadow-xs" : "text-stone-400 hover:text-white")
                  }
                >
                  <ImageIcon size={13} />
                  <span>Photos</span>
                </button>
                <button
                  onClick={() => setActiveTab("videos")}
                  className={
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition " +
                    (activeTab === "videos" ? "bg-amber-400 text-stone-950 shadow-xs" : "text-stone-400 hover:text-white")
                  }
                >
                  <Film size={13} />
                  <span>Videos</span>
                </button>
              </div>
            </div>

            {/* Target Select Dropdown: STRICTLY CATEGORY & DECORATION */}
            <div className="mt-5">
              <label className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                SELECT DESTINATION (CATEGORY / DECORATION ONLY):
              </label>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-800/90 p-3 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
              >
                {availableTargets.map((t, idx) => (
                  <option key={idx} value={t.section + ":" + t.name}>
                    [{t.section.toUpperCase()}] -> {t.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-stone-500">
                Files uploaded here route exclusively to Category feeds or Decoration albums on guest screens.
              </p>
            </div>

            {/* Drop / Upload Zone */}
            <label className="mt-6 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-700 hover:border-amber-400/80 bg-stone-950/40 p-8 text-center cursor-pointer transition group">
              <input
                type="file"
                multiple
                accept={activeTab === "photos" ? "image/*" : "video/*"}
                onChange={(e) => handleUploadFiles(e.target.files)}
                className="hidden"
                disabled={isUploading || !selectedTarget}
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-800/80 group-hover:bg-amber-400/10 text-stone-300 group-hover:text-amber-400 transition">
                {isUploading ? <Loader2 size={24} className="animate-spin text-amber-400" /> : <Upload size={24} />}
              </div>
              <h4 className="mt-4 text-sm font-black text-white">
                {isUploading ? "Auto-Compressing & Uploading..." : "Drag & Drop " + (activeTab === "photos" ? "Photos" : "Videos") + " Here"}
              </h4>
              <p className="mt-1 text-xs text-stone-400">
                Target: <span className="text-amber-400 font-bold">{selectedTarget.replace(":", " ? ")}</span>
              </p>
              <span className="mt-4 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-stone-950 shadow-md group-hover:brightness-105 transition">
                {isUploading ? "Processing..." : "Browse " + (activeTab === "photos" ? "Images" : "Videos")}
              </span>
              <p className="mt-3 text-[10px] text-stone-500">
                Auto-compressed on canvas for maximum sharpness &amp; zero guest lag.
              </p>
            </label>
          </div>

          {/* Success Status */}
          {saveSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400">
              <CheckCircle2 size={16} />
              <span>Media uploaded, compressed, and broadcast live!</span>
            </div>
          )}
        </div>

        {/* Right: Published Vault */}
        <div className="lg:col-span-7 rounded-3xl border border-stone-800/90 bg-stone-900/50 p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Published {activeTab === "photos" ? "Photos" : "Videos"} ({filteredVault.length})
              </h3>
              <p className="text-[11px] text-stone-400">Total in vault: {mediaVault.length} media items</p>
            </div>

            {/* Vault Filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-stone-400" />
              <select
                value={filterTarget}
                onChange={(e) => setFilterTarget(e.target.value)}
                className="rounded-xl border border-stone-700 bg-stone-800/80 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-hidden"
              >
                <option value="ALL">All Categories &amp; Albums</option>
                {availableTargets.map((t, idx) => (
                  <option key={idx} value={t.section + ":" + t.name}>
                    [{t.section.toUpperCase()}] -> {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Media Items Grid */}
          <div className="mt-6 flex-1 overflow-y-auto max-h-[580px] no-scrollbar">
            {filteredVault.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-12 w-12 rounded-2xl bg-stone-800/60 flex items-center justify-center text-stone-500 mb-3">
                  {activeTab === "photos" ? <ImageIcon size={22} /> : <Film size={22} />}
                </div>
                <h4 className="text-sm font-bold text-stone-400">No media published in this section yet.</h4>
                <p className="text-xs text-stone-600 mt-1">Select a category or decoration album on the left to upload.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {filteredVault.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl border border-stone-800 bg-stone-950/60 overflow-hidden shadow-xs hover:border-stone-700 transition"
                  >
                    <div className="aspect-[4/3] w-full bg-stone-900 overflow-hidden relative">
                      {item.type === "photo" ? (
                        <img src={item.url} alt={item.category} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <video src={item.url} className="h-full w-full object-cover" />
                      )}

                      <span className="absolute top-2 left-2 rounded-md bg-stone-950/80 px-2 py-0.5 text-[9px] font-black text-amber-400 backdrop-blur-xs">
                        {item.section}: {item.category}
                      </span>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition cursor-pointer"
                        title="Delete media"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
