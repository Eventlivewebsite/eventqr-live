"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, FolderHeart, ChevronRight, Video } from "lucide-react";
import { useRouter } from "next/navigation";

interface VideoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoDrawer({ isOpen, onClose }: VideoDrawerProps) {
  const router = useRouter();
  const [decorationAlbums, setDecorationAlbums] = useState<string[]>([
    "Main Stage", "Entrance Gate", "Floral Decor", "Lighting Setup", "VIP Lounge"
  ]);
  const [currentSlug, setCurrentSlug] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlSlug = sp.get("event") || sp.get("slug") || "";
      const s = urlSlug || (typeof window !== "undefined" ? sessionStorage.getItem("active_event_slug") : "") || "";
      if (urlSlug) {
        sessionStorage.setItem("active_event_slug", urlSlug);
      }
      if (s) {
        setCurrentSlug(s);
        sessionStorage.setItem("active_event_slug", s);
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`, { cache: "no-store", headers: { "Pragma": "no-cache" } })
          .then((r) => r.json())
          .then((d) => {
            const decor = d?.event?.decorationAlbums || d?.event?.decorAlbums;
            if (Array.isArray(decor) && decor.length > 0) {
              setDecorationAlbums(decor);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleSelectAlbum = (albumName: string) => {
    onClose();
    const query = currentSlug ? `?event=${encodeURIComponent(currentSlug)}&decor=${encodeURIComponent(albumName)}` : `?decor=${encodeURIComponent(albumName)}`;
    router.push(`/videos${query}`);
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden">
      {/* Dark blur backdrop locked to container */}
      <div 
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Slide-out Panel locked within container bounds */}
      <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm bg-stone-900/98 text-stone-100 border-l border-amber-500/20 shadow-2xl flex flex-col p-5 backdrop-blur-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-600/30 text-amber-400 border border-amber-500/30 shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-amber-300 uppercase">
                Decoration Hub
              </h2>
              <p className="text-[10px] text-stone-400 font-medium">
                Admin Exclusive Venue Albums
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-700 transition active:scale-90"
            aria-label="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Category List from Admin */}
        <div className="mt-5 flex-1 overflow-y-auto space-y-2.5 no-scrollbar">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-bold text-amber-500/90 uppercase tracking-widest">
              Live Decor Albums
            </p>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {decorationAlbums.length} Albums
            </span>
          </div>

          {decorationAlbums.map((album, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectAlbum(album)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-stone-800/70 hover:bg-gradient-to-r hover:from-amber-600/20 hover:to-stone-800/90 border border-stone-700/60 hover:border-amber-500/50 transition cursor-pointer active:scale-98 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-stone-700/60 text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950 transition duration-200">
                  <FolderHeart size={16} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 transition block">
                    {album}
                  </span>
                  <span className="text-[9px] text-stone-500 flex items-center gap-1">
                    <Video size={10} /> Videos & Reels
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-stone-500 group-hover:text-amber-400 transition transform group-hover:translate-x-0.5" />
            </div>
          ))}
        </div>

        {/* Footer Brand */}
        <div className="border-t border-stone-800 pt-3 text-center">
          <span className="text-[9px] tracking-widest text-amber-400/70 uppercase font-semibold">
            • Luxury Agency Engine •
          </span>
        </div>
      </div>
    </div>
  );
}
