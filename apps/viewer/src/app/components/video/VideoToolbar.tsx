"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Menu, Sparkles, FolderHeart, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VideoToolbar() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlSlug = sp.get("event") || sp.get("slug") || "";
      const s = urlSlug || (typeof window !== "undefined" ? sessionStorage.getItem("active_event_slug") : "") || "";
      if (urlSlug) {
        sessionStorage.setItem("active_event_slug", urlSlug);
      }
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push(s ? `/?slug=${encodeURIComponent(s)}` : "/");
      }
    } else {
      router.back();
    }
  };

  const [eventName, setEventName] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [decorationAlbums, setDecorationAlbums] = useState<string[]>([
    "Main Stage", "Entrance Gate", "Floral Decor", "Lighting Setup", "VIP Lounge"
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlSlug = sp.get("event") || sp.get("slug") || "";
      const s = urlSlug || (typeof window !== "undefined" ? sessionStorage.getItem("active_event_slug") : "") || "";
      if (urlSlug) {
        sessionStorage.setItem("active_event_slug", urlSlug);
      }
      if (s) {
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`, { cache: "no-store", headers: { "Pragma": "no-cache" } })
          .then((r) => r.json())
          .then((d) => {
            const title = d?.event?.name || d?.event?.title || "";
            if (title) setEventName(title);
            const decor = d?.event?.decorationAlbums || d?.event?.decorAlbums;
            if (Array.isArray(decor) && decor.length > 0) {
              setDecorationAlbums(decor);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes luxuryColorShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-event-heading {
          background: linear-gradient(135deg, #f59e0b 0%, #ec4899 40%, #8b5cf6 70%, #d97706 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: luxuryColorShift 6s ease-in-out infinite;
          letter-spacing: 0.12em;
        }
      `}</style>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-200/80 px-4 py-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition active:scale-95 shadow-sm"
        >
          <ArrowLeft size={19} />
        </button>

        <div className="text-center">
          <h1 className="animated-event-heading text-lg font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
            {eventName || "WASIM"}
          </h1>
          <p className="text-[10px] font-semibold text-stone-500 tracking-wider uppercase mt-0.5">
            Cinema & Highlights
          </p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-800 border border-amber-300/40 hover:bg-amber-500/20 transition active:scale-95 shadow-sm"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* DECORATION DRAWER FOR VIDEOS */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative z-10 w-full max-w-xs h-full bg-stone-900/95 text-stone-100 border-l border-amber-500/20 shadow-2xl flex flex-col p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-amber-300 uppercase">Decoration Hub</h2>
                  <p className="text-[10px] text-stone-400">Video Highlights & Decor</p>
                </div>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="mt-5 flex-1 overflow-y-auto space-y-2.5 no-scrollbar">
              {decorationAlbums.map((album, idx) => (
                <div
                  key={idx}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-800/60 hover:bg-amber-600/20 border border-stone-700/50 hover:border-amber-500/40 transition cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <FolderHeart size={16} className="text-amber-400" />
                    <span className="text-xs font-semibold text-stone-200">{album}</span>
                  </div>
                  <ChevronRight size={14} className="text-stone-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
