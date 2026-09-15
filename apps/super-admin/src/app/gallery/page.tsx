"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  ShieldCheck,
  Trash2,
  Filter,
  RefreshCw,
  Loader2,
  Calendar,
  Sparkles,
  ExternalLink,
  Eye,
  AlertCircle,
} from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  createdAt: string;
  event?: {
    id: string;
    name?: string;
    title?: string;
    slug?: string;
  };
}

interface EventItem {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
}

export default function SuperAdminGalleryPage() {
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        selectedEventId === "ALL"
          ? "/api/gallery"
          : `/api/gallery?eventId=${encodeURIComponent(selectedEventId)}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json().catch(() => ({ success: false }));

      if (data.success) {
        setPhotos(data.photos || []);
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Gallery fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleDelete = async (photoId: string) => {
    if (!confirm("Remove this image from live feeds & gallery?")) return;
    setDeletingId(photoId);

    try {
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(photoId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } else {
        alert("Failed to delete media item.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#030712] min-h-screen text-slate-100 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-pink-400 font-mono text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Master Content &amp; Media Moderation
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Universal Media Gallery
          </h1>
          <p className="text-xs text-slate-400">
            Monitor, inspect, and moderate real-time guest uploads across all client events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Event Dropdown Filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Events Media ({events.length} Events)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name || ev.title || "Untitled"} (/{ev.slug})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchGallery}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Media Grid Container */}
      <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-bold text-white">Live Upload Stream</h2>
            <span className="text-xs text-slate-500 font-mono">({photos.length} items loaded)</span>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            <span className="text-xs">Loading media assets...</span>
          </div>
        ) : photos.length === 0 ? (
          <div className="p-20 text-center text-slate-500 space-y-3">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-sm font-bold text-slate-300">No media uploads found</p>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Once guests or studio admins start uploading photos to live events via QR code, they will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {photos.map((item) => (
              <div
                key={item.id}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-square flex flex-col justify-end transition hover:border-pink-500/50"
              >
                {/* Image */}
                <img
                  src={item.url}
                  alt="Upload"
                  className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Event Tag Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-slate-300 border border-white/10 truncate max-w-[100px]">
                      /{item.event?.slug || "event"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(item.url)}
                      className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer"
                      title="Enlarge"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-white truncate">
                      {item.event?.name || item.event?.title || "Event Media"}
                    </p>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="w-full py-1.5 bg-rose-500/80 hover:bg-rose-600 text-white text-[10px] font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3" />
                          <span>Moderate / Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Large Image Lightbox Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <img
              src={previewImage}
              alt="Enlarged preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-slate-800"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 text-white border border-slate-700 flex items-center justify-center cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}