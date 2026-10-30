"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

const DEFAULT_DECORATIONS = [
  "Floral Decor",
  "Stage Decor",
  "Lighting",
  "Entrance",
  "Dining",
  "Selfie Booth",
  "Reception Hall"
];

export default function GalleryDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<string[]>(DEFAULT_DECORATIONS);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      let activeSlug = sp.get("event") || sp.get("slug") || "";
      if (!activeSlug) {
        activeSlug = sessionStorage.getItem("active_event_slug") || "";
      }
      if (activeSlug) {
        setSlug(activeSlug);
        sessionStorage.setItem("active_event_slug", activeSlug);
        fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`)
          .then((r) => r.json())
          .then((d) => {
            const decorList = d?.event?.decorationItems;
            if (Array.isArray(decorList) && decorList.length > 0) {
              setItems(decorList);
            }
          })
          .catch(() => {});
      }
    }
  }, [open]);

  if (!open) return null;

  const handleSelectAlbum = (title: string) => {
    onClose();
    const query = new URLSearchParams();
    if (slug) query.set("event", slug);
    query.set("category", title.toLowerCase());
    router.push(`/gallery?${query.toString()}`);
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
      />

      {/* Drawer Card */}
      <div className="absolute top-0 right-0 h-full w-[85%] max-w-[340px] bg-white shadow-2xl flex flex-col rounded-l-[28px] border-l border-stone-200/80 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="relative border-b border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black text-stone-900">
                <Sparkles size={20} className="text-amber-500" />
                Decoration
              </h2>
              <p className="mt-0.5 text-xs font-medium text-stone-500">
                Event Decoration Albums
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-stone-200 text-stone-600 transition hover:bg-stone-50"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* List of Albums */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {items.map((title, idx) => (
            <button
              key={`${title}-${idx}`}
              onClick={() => handleSelectAlbum(title)}
              className="group flex w-full items-center justify-between rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-xs transition hover:border-amber-400 hover:bg-amber-50/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-stone-900 to-stone-700 text-amber-300 shadow-xs">
                  <ImageIcon size={18} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-stone-800">
                    {title}
                  </h3>
                  <p className="text-[11px] font-medium text-stone-400">View Collection</p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-stone-800"
              />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
