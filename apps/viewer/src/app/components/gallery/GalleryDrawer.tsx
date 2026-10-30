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
      const activeSlug = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (activeSlug) {
        setSlug(activeSlug);
        fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d?.success && Array.isArray(d?.event?.decorationItems) && d.event.decorationItems.length > 0) {
              setItems(d.event.decorationItems);
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
    if (slug) query.set("slug", slug);
    query.set("category", title.toLowerCase());
    router.push(`/gallery?${query.toString()}`);
  };

  return (
    <>
      <div
        onClick={onClose}
        className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute top-0 right-0 z-50 h-full w-[85%] max-w-[340px] overflow-hidden rounded-l-[28px] border-l border-stone-200/60 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="relative overflow-hidden border-b border-pink-100 bg-gradient-to-br from-white via-pink-50 to-rose-100 p-6">
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Sparkles size={22} className="text-pink-500" />
                Decoration
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Live Decoration Albums
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-md transition hover:scale-105"
            >
              <X size={18} className="text-gray-700" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.map((title, idx) => (
            <button
              key={`${title}-${idx}`}
              onClick={() => handleSelectAlbum(title)}
              className="group flex w-full items-center justify-between rounded-2xl border border-pink-100/70 bg-white p-3.5 shadow-sm transition hover:border-pink-300 hover:bg-pink-50/50 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-sm">
                  <ImageIcon size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {title}
                  </h3>
                  <p className="text-[11px] text-gray-400">View Collection</p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-pink-400 transition group-hover:translate-x-0.5 group-hover:text-pink-600"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
