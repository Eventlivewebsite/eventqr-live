"use client";

import React, { useState, useEffect } from "react";
import { 
  Image as ImageIcon, Film, Upload, Trash2, Loader2, 
  Sparkles, CheckCircle2, ChevronDown, FolderOpen, ExternalLink,
  Filter, Eye, Check
} from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  type: "photo" | "video";
  section: string; // e.g., "Category", "Decoration", "Food", "Family", "Hero"
  category: string;
  createdAt: string;
}

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
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function PhotosAndMediaHub() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  const [eventData, setEventData] = useState<any>(null);
  const [loadingEventData, setLoadingEventData] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"photo" | "video">("photo");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Target routing options populated from setup form
  const [availableTargets, setAvailableTargets] = useState<{ section: string; name: string }[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [mediaVault, setMediaVault] = useState<MediaItem[]>([]);
  const [filterTarget, setFilterTarget] = useState<string>("ALL");

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
        const res = await fetch(`/api/events/${selectedEventId}/configure`);
        const json = await res.json();
        if (json.success && json.event) {
          setEventData(json.event);
          const cm = json.event.customMap || {};
          
          const targets: { section: string; name: string }[] = [];

          // 1. Photos/Videos Categories
          try {
            const cats = cm.photoCategories ? JSON.parse(cm.photoCategories) : ["Ceremony", "Haldi", "Reception", "Family"];
            cats.forEach((c: string) => targets.push({ section: "Category", name: c }));
          } catch {}

          // 2. Decoration Albums
          try {
            const decors = cm.decorationItems ? JSON.parse(cm.decorationItems) : ["Stage Decor", "Entrance", "Lighting"];
            decors.forEach((d: string) => targets.push({ section: "Decoration", name: d }));
          } catch {}

          // 3. Food Dishes
          try {
            const foods = cm.foodItems ? JSON.parse(cm.foodItems) : [];
            foods.forEach((f: any) => targets.push({ section: "Food", name: f.name || "Dish Item" }));
          } catch {}

          // 4. Family & VIPs
          try {
            const fam = cm.familyMembers ? JSON.parse(cm.familyMembers) : [];
            fam.forEach((m: any) => targets.push({ section: "Family", name: m.name || "Key Member" }));
          } catch {}

          // 5. Hero Highlights
          targets.push({ section: "Hero", name: "Hero Highlights & Slideshow" });

          setAvailableTargets(targets);
          if (targets.length > 0) {
            setSelectedTarget(`${targets[0].section}:${targets[0].name}`);
          }

          // Parse existing vault
          let parsedVault: MediaItem[] = [];
          try {
            if (cm.mediaVault) parsedVault = JSON.parse(cm.mediaVault);
          } catch {}
          setMediaVault(parsedVault);
        }
      } catch (err) {
        console.error("Error loading event media:", err);
      } finally {
        setLoadingEventData(false);
      }
    }

    loadEventMedia();
  }, [selectedEventId]);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedTarget) return;
    setIsUploading(true);

    try {
      const [sec, name] = selectedTarget.split(":");
      const newItems: MediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVid = file.type.startsWith("video/");
        const base64Uri = await autoCompressFile(file);

        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          url: base64Uri,
          type: isVid ? "video" : "photo",
          section: sec,
          category: name,
          createdAt: new Date().toISOString(),
        });
      }

      const updatedVault = [...newItems, ...mediaVault];
      setMediaVault(updatedVault);

      // Persist to backend configure endpoint
      await fetch(`/api/events/${selectedEventId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaVault: updatedVault }),
      });

      setSaveSuccessMsg(`✓ Successfully compressed & uploaded ${newItems.length} item(s) to [${sec}] ${name}!`);
      setTimeout(() => setSaveSuccessMsg(""), 4500);
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const updated = mediaVault.filter(m => m.id !== itemId);
    setMediaVault(updated);
    try {
      await fetch(`/api/events/${selectedEventId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaVault: updated }),
      });
    } catch {}
  };

  const visibleMedia = mediaVault.filter((m) => {
    if (m.type !== activeMediaTab) return false;
    if (filterTarget !== "ALL") {
      const targetIdentifier = `${m.section}:${m.category}`;
      if (targetIdentifier !== filterTarget) return false;
    }
    return true;
  });

  if (loadingEvents) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-slate-100">
      
      {/* Top Header Card */}
      <div className="bg-[#0b101b] border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="text-amber-400 h-6 w-6" /> Media Studio & Publishing Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose category target, drop media, and auto-publish directly to Live Guest screens.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase whitespace-nowrap">Active Event:</span>
          <div className="relative flex-1 md:w-64">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700/80 font-bold text-xs text-white rounded-2xl py-3 px-4 pr-10 outline-none focus:border-amber-500 shadow-sm cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.type})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {eventData?.slug && (
            <a
              href={`http://localhost:3000/?event=${eventData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1 text-xs font-bold px-4 py-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition shadow-sm whitespace-nowrap"
            >
              <span>Live Viewer</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} /> {saveSuccessMsg}
        </div>
      )}

      {/* Main Studio Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Upload Dispatcher Panel */}
        <div className="lg:col-span-5 bg-[#0b101b] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FolderOpen className="text-amber-400 h-4 w-4" /> Upload Router & Compressor
            </h2>
            
            {/* Photo / Video Switch */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveMediaTab("photo")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeMediaTab === "photo" 
                    ? "bg-amber-500 text-black shadow" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Photos
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab("video")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeMediaTab === "video" 
                    ? "bg-amber-500 text-black shadow" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Videos
              </button>
            </div>
          </div>

          {/* Target Dropdown Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
              Select Destination Field / Album / Category:
            </label>
            <div className="relative">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full appearance-none bg-slate-900 border border-slate-700/80 text-white font-bold text-xs rounded-2xl p-3.5 pr-10 outline-none focus:border-amber-500 cursor-pointer"
              >
                {availableTargets.map((t, idx) => (
                  <option key={idx} value={`${t.section}:${t.name}`}>
                    [{t.section.toUpperCase()}] → {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Files uploaded will automatically route to this section on the live viewer.
            </p>
          </div>

          {/* Unified Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleUploadFiles(e.dataTransfer.files);
              }
            }}
            className="border-2 border-dashed border-slate-700 hover:border-amber-400/80 bg-slate-900/60 rounded-3xl p-8 text-center transition flex flex-col items-center justify-center space-y-3 cursor-pointer group"
          >
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              {isUploading ? (
                <Loader2 className="animate-spin h-6 w-6 text-amber-400" />
              ) : activeMediaTab === "photo" ? (
                <ImageIcon size={24} />
              ) : (
                <Film size={24} />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-200">
                {isUploading ? "Compressing & Publishing..." : `Drag & Drop ${activeMediaTab === "photo" ? "Photos" : "Videos"} Here`}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Target: <span className="text-amber-400 font-semibold">{selectedTarget.replace(":", " → ")}</span>
              </p>
            </div>

            <label className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition mt-2">
              <Upload size={14} /> Browse {activeMediaTab === "photo" ? "Images" : "Videos"}
              <input
                type="file"
                multiple
                accept={activeMediaTab === "photo" ? "image/*" : "video/*"}
                className="hidden"
                disabled={isUploading}
                onChange={(e) => handleUploadFiles(e.target.files)}
              />
            </label>
            <span className="text-[10px] text-slate-500">
              Auto-compressed on canvas for maximum sharpness & instant loading.
            </span>
          </div>
        </div>

        {/* Right: Live Gallery & Category Filter Feed */}
        <div className="lg:col-span-7 bg-[#0b101b] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5">
          
          {/* Header & Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Eye className="text-amber-400 h-4 w-4" /> Published {activeMediaTab === "photo" ? "Photos" : "Videos"} ({visibleMedia.length})
              </h2>
              <span className="text-[11px] text-slate-400">Total in vault: {mediaVault.length} media items</span>
            </div>

            {/* Filter Category Dropdown */}
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-slate-400" />
              <select
                value={filterTarget}
                onChange={(e) => setFilterTarget(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white font-semibold text-xs rounded-xl px-3 py-1.5 outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">All Categories & Albums</option>
                {availableTargets.map((t, i) => (
                  <option key={i} value={`${t.section}:${t.name}`}>
                    {t.section}: {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Media Grid */}
          {visibleMedia.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-xs text-slate-500 font-semibold">No {activeMediaTab} files published in this section yet.</p>
              <p className="text-[11px] text-slate-600">Select a category on the left to upload your first item.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
              {visibleMedia.map((item) => (
                <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-slate-800 aspect-square bg-slate-900 shadow-sm">
                  {item.type === "photo" ? (
                    <img src={item.url} alt="Media" className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <video src={item.url} className="h-full w-full object-cover" />
                  )}

                  {/* Section Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-extrabold text-amber-300 border border-white/10 uppercase">
                    {item.category}
                  </div>

                  {/* Hover Delete Action */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
