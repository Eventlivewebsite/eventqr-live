"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  onMenuClick?: () => void;
};

export default function VideoHeader({ onMenuClick }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("Films & Videos");
  const [subtitle, setSubtitle] = useState("Relive Every Moment");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      let s = sp.get("event") || sp.get("slug") || "";
      if (!s) {
        s = sessionStorage.getItem("active_event_slug") || "";
      }

      if (s) {
        sessionStorage.setItem("active_event_slug", s);
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d?.event?.title) {
              setTitle(d.event.title);
            }
            if (d?.event?.subtitle || d?.event?.ceremonyName) {
              setSubtitle(d.event.subtitle || d.event.ceremonyName);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3.5">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-xs transition hover:bg-stone-50 cursor-pointer active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Title connected to Admin Event Title */}
        <div className="text-center px-2 flex-1 min-w-0">
          <h1 className="text-lg font-black tracking-tight text-stone-900 truncate text-center">
            {title}
          </h1>
          <p className="text-[11px] font-medium text-stone-500 truncate mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Menu Drawer */}
        <button
          onClick={() => onMenuClick?.()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-xs transition hover:bg-stone-50 cursor-pointer active:scale-95"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}
