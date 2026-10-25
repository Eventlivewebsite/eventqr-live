"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  onMenuClick?: () => void;
};

export default function GalleryHeader({ onMenuClick }: Props) {
  const router = useRouter();
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (s) {
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d?.event?.name || d?.event?.title) {
              setEventName(d.event.name || d.event.title);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-700 active:scale-95 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-extrabold text-stone-900 leading-tight">
            {eventName || "Photo Gallery"}
          </h1>
          <p className="text-[10px] text-stone-500 font-semibold">Shared Memories</p>
        </div>
      </div>

      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-700 active:scale-95 transition"
        >
          <Menu size={18} />
        </button>
      )}
    </header>
  );
}