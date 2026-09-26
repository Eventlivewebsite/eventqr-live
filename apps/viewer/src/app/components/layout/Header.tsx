"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

type Props = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: Props) {
  const [title, setTitle] = useState("A & S WEDDING");
  const [subtitle, setSubtitle] = useState("Forever Begins Today");

  useEffect(() => {
    async function loadHeader() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && json?.event) {
          if (json.event.title) setTitle(json.event.title);
          if (json.event.subtitle) setSubtitle(json.event.subtitle);
        }
      } catch {}
    }
    loadHeader();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[430px] items-center justify-between px-4">
        <div>
          <h1 className="text-[17px] font-bold tracking-wide text-[#B68D40] line-clamp-1 uppercase">
            {title}
          </h1>
          <p className="text-xs text-gray-500 line-clamp-1">
            {subtitle}
          </p>
        </div>

        <button
          onClick={onMenuClick}
          aria-label="Open Menu"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-amber-50 hover:shadow-xl active:scale-95"
        >
          <Menu className="text-[#B68D40]" size={22} />
        </button>
      </div>
    </header>
  );
}