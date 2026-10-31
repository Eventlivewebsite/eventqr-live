"use client";

import { useEffect, useState } from "react";
import { X, ChevronRight, Sparkles, Film } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
};

export default function VideoDrawer({
  open,
  onClose,
  onSelect,
}: Props) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      let activeSlug = sp.get("event") || sp.get("slug") || "";
      if (!activeSlug) {
        activeSlug = sessionStorage.getItem("active_event_slug") || "";
      }

      if (activeSlug) {
        sessionStorage.setItem("active_event_slug", activeSlug);
        setLoading(true);
        fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`)
          .then((r) => r.json())
          .then((d) => {
            const decorList = d?.event?.decorationItems;
            if (Array.isArray(decorList) && decorList.length > 0) {
              setItems(decorList);
            } else {
              setItems([]);
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-[85%] max-w-[340px] bg-white shadow-2xl flex flex-col rounded-l-[28px] border-l border-stone-200/80 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="relative border-b border-rose-100 bg-gradient-to-br from-stone-900 via-stone-800 to-black p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <h2 className="text-xl font-black tracking-tight text-white">
                  Decoration
                </h2>
              </div>
              <p className="mt-0.5 text-xs font-medium text-stone-300">
                Cinematic Video Collections
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* List of Albums */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              {loading ? "Loading albums..." : "No decoration albums configured yet."}
            </div>
          ) : (
            items.map((title) => (
              <button
                key={title}
                onClick={() => {
                  onSelect(title);
                  onClose();
                }}
                className="group flex w-full items-center justify-between rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-xs transition hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-stone-900 to-stone-700 text-amber-300 shadow-xs">
                    <Film size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-800">
                      {title}
                    </h3>
                    <p className="text-[11px] font-medium text-stone-400">Watch Films</p>
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  className="text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-stone-800"
                />
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
