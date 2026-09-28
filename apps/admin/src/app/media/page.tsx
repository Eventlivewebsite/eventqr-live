"use client";

import React, { useState, useEffect } from "react";
import { 
  Image as ImageIcon, Film, Upload, Trash2, Loader2, 
  Sparkles, CheckCircle2, ChevronDown, Layers, ArrowUpRight
} from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  type: "photo" | "video";
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
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<"photo" | "video">("photo");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const [categories, setCategories] = useState<string[]>([]);
  const [mediaVault, setMediaVault] = useState<MediaItem[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoadingEvents(true);
        const res = await fetch("/api/events");
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
          
          let parsedCats: string[] = ["General", "Ceremony", "Stage", "Celebrations", "Family"];
          try {
            if (cm.photoCategories) {
              const loaded = JSON.parse(cm.photoCategories);
              if (Array.isArray(loaded) && loaded.length > 0) parsedCats = loaded;
            }
          } catch {}
          setCategories(parsedCats);

          let parsedMedia: MediaItem[] = [];
          try {
            if (cm.mediaVault) {
              parsedMedia = JSON.parse(cm.mediaVault);
            }
          } catch {}
          setMediaVault(parsedMedia);
        }
      } catch (err) {
        console.error("Error loading event media:", err);
      } finally {
        setLoadingEventData(false);
      }
    }

    loadEventMedia();
  }, [selectedEventId]);

  const handleFilesUpload = async (cat: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingCategory(cat);

    try {
      const newItems: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVid = file.type.startsWith("video/");
        const base64Uri = await autoCompressFile(file);

        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: base64Uri,
          type: isVid ? "video" : "photo",
          category: cat,
          createdAt: new Date().toISOString(),
        });
      }

      const updatedVault = [...newItems, ...mediaVault];
      setMediaVault(updatedVault);

      await fetch(`/api/events/${selectedEventId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaVault: updatedVault }),
      });

      setSaveSuccessMsg(`✓ Uploaded ${newItems.length} item(s) to ${cat}!`);
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploadingCategory(null);
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

  if (loadingEvents) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-gray-900">
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ImageIcon className="text-amber-500 h-7 w-7" /> Photos & Media Upload Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Category-wise apartment routing with auto-compression engine.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-gray-600 uppercase whitespace-nowrap">Select Event:</label>
          <div className="relative flex-1 md:w-64">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-gray-300 font-bold text-xs text-gray-800 rounded-2xl py-3 px-4 pr-10 outline-none focus:border-amber-500 shadow-sm cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.type})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {eventData?.slug && (
            <a
              href={`http://localhost:3000/?event=${eventData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1 text-xs font-bold px-4 py-3 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition shadow-sm whitespace-nowrap"
            >
              <span>Live Viewer</span>
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} /> {saveSuccessMsg}
        </div>
      )}

      <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveMediaTab("photo")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm ${
            activeMediaTab === "photo" 
              ? "bg-slate-900 text-white" 
              : "bg-white text-gray-600 border hover:bg-gray-50"
          }`}
        >
          <ImageIcon size={15} /> Photo Apartments ({mediaVault.filter(m => m.type === "photo").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveMediaTab("video")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm ${
            activeMediaTab === "video" 
              ? "bg-slate-900 text-white" 
              : "bg-white text-gray-600 border hover:bg-gray-50"
          }`}
        >
          <Film size={15} /> Video Apartments ({mediaVault.filter(m => m.type === "video").length})
        </button>
      </div>

      {loadingEventData ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-amber-500 h-8 w-8 mb-2" />
          <p className="text-xs text-gray-500 font-medium">Loading apartments for selected event...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => {
            const catMedia = mediaVault.filter(m => m.category === cat && m.type === activeMediaTab);
            const isThisUploading = uploadingCategory === cat;

            return (
              <div key={cat} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-gray-900">{cat} Apartment</h2>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {catMedia.length} {activeMediaTab === "photo" ? "photos" : "videos"} uploaded
                      </span>
                    </div>
                  </div>

                  <label className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm">
                    {isThisUploading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>Compressing & Storing...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Upload to {cat}</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept={activeMediaTab === "photo" ? "image/*" : "video/*"}
                      className="hidden"
                      disabled={Boolean(uploadingCategory)}
                      onChange={(e) => handleFilesUpload(cat, e.target.files)}
                    />
                  </label>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFilesUpload(cat, e.dataTransfer.files);
                    }
                  }}
                  className="border-2 border-dashed border-gray-200 hover:border-amber-400 bg-slate-50/60 rounded-2xl p-5 text-center transition cursor-pointer"
                >
                  <p className="text-xs font-semibold text-gray-500">
                    Drag and drop {activeMediaTab} files directly here into <span className="text-amber-600 font-bold">{cat}</span>
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Images are auto-compressed in high definition without losing clarity.
                  </span>
                </div>

                {catMedia.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4 italic">
                    No {activeMediaTab} files in this apartment yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {catMedia.map((item) => (
                      <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-gray-200 aspect-square bg-gray-100 shadow-sm">
                        {item.type === "photo" ? (
                          <img src={item.url} alt="Media" className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                        ) : (
                          <video src={item.url} className="h-full w-full object-cover" />
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition"
                            title="Delete Media"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
