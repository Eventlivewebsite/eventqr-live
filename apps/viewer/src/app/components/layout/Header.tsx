"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

type Props = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: Props) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const sp = new URLSearchParams(window.location.search);
        const s = sp.get("event") || sp.get("slug") || "";
        const c = sessionStorage.getItem("cached_event_data_" + s);
        if (c) {
          const p = JSON.parse(c);
          return p.subtitle || p.customMap?.subtitle || "";
        }
      } catch {}
    }
    return "";
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";

    // Instant local cache read - 0ms render
    try {
      const cached = sessionStorage.getItem(`header_${activeSlug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.subtitle) setSubtitle(parsed.subtitle);
      }
    } catch {}

    async function loadHeader() {
      try {
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`);
        const json = await res.json();
        if (json?.success && json?.event) {
          const t = json.event.title || "";
          const st = json.event.subtitle || "";
          setTitle(t);
          setSubtitle(st);
          try {
            sessionStorage.setItem(`header_${activeSlug}`, JSON.stringify({ title: t, subtitle: st }));
          } catch {}
        }
      } catch {}
    }
    loadHeader();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[56px] py-2 max-w-[430px] items-center justify-between px-4">
        <div>
          {title ? (
            <>
              <h1 className="text-[16px] font-extrabold tracking-wide text-[#B68D40] break-words whitespace-normal leading-tight uppercase">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] font-medium text-gray-500 break-words whitespace-normal leading-tight">
                  {subtitle}
                </p>
              )}
            </>
          ) : (
            <div className="space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-stone-100" />
            </div>
          )}
        </div>

        <button
          onClick={onMenuClick}
          aria-label="Open Menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-50 shadow-sm transition-all duration-200 hover:bg-amber-50 active:scale-95"
        >
          <Menu className="text-[#B68D40]" size={19} />
        </button>
      </div>
    </header>
  );
}
