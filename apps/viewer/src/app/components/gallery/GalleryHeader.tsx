"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Menu, X, Sparkles, FolderHeart, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GalleryHeader() {
  const router = useRouter();
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
        sessionStorage.setItem("active_event_slug", s);
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`, { cache: "no-store", headers: { "Pragma": "no-cache" } })
          .then((r) => r.json())
          .then((d) => {
            const title = d?.event?.name || d?.event?.title || d?.event?.groomBride || "";
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
        .luxury-glass {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .drawer-blur {
          background: rgba(15, 15, 20, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>

      <header className="sticky top-0 z-40 luxury-glass border-b border-stone-200/80 px-4 py-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100/90 text-stone-700 transition hover:bg-stone-200 active:scale-90 shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="text-center">
            <h1 className="animated-event-heading text-lg font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
              {eventName || "WASIM"}
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse"></span>
              <p className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
                Premium Event Archive
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500/10 to-amber-500/20 text-stone-800 transition hover:bg-amber-500/30 active:scale-90 shadow-sm border border-amber-300/40"
            aria-label="Open Decoration Albums"
          >
            <Menu size={20} className="text-amber-800" />
          </button>
        </div>
      </header>

      {/* LUXURY DECORATION SLIDE DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end transition-all duration-300">
          <div
            className="fixed inset-0 drawer-blur transition-opacity animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative z-10 w-full max-w-xs h-full bg-stone-900/95 text-stone-100 border-l border-amber-500/20 shadow-2xl flex flex-col p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-wide text-amber-300 uppercase">Decoration Hub</h2>
                  <p className="text-[10px] text-stone-400">Exclusive Venue Albums</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex-1 overflow-y-auto space-y-2.5 no-scrollbar">
              <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest px-1">
                Active Decor Albums
              </p>
              {decorationAlbums.map((album, idx) => (
                <div
                  key={idx}
                  onClick={() => setIsDrawerOpen(false)}
                  className="group flex items-center justify-between p-3.5 rounded-2xl bg-stone-800/60 hover:bg-gradient-to-r hover:from-amber-600/20 hover:to-stone-800 border border-stone-700/50 hover:border-amber-500/50 transition cursor-pointer active:scale-98 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-stone-700/60 text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950 transition">
                      <FolderHeart size={16} />
                    </div>
                    <span className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 transition">
                      {album}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-stone-500 group-hover:text-amber-400 transition transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>

            <div className="border-t border-stone-800 pt-4 text-center">
              <span className="text-[10px] tracking-wider text-amber-400/70 uppercase font-medium">
                • Luxury Experience Engine •
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
