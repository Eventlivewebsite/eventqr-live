"use client";

import { useState, useEffect } from "react";

type Props = {
  active: string;
  onChange: (value: string) => void;
  videoType?: string;
};

export default function VideoFilter({ active, onChange }: Props) {
  const [categories, setCategories] = useState<string[]>(["All", "Ceremony", "Stage", "Celebrations", "Family"]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (s) {
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`)
          .then((r) => r.json())
          .then((d) => {
            const list = d?.event?.categoriesList || d?.event?.videoCategories || d?.event?.photoCategories;
            if (list && Array.isArray(list) && list.length > 0) {
              const formatted = list.map((item: any) => (typeof item === "string" ? item : item.name || item.title || "")).filter(Boolean);
              if (formatted.length > 0) {
                setCategories(["All", ...formatted]);
              }
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5">
      {categories.map((cat) => {
        const isActive = active.toLowerCase() === cat.toLowerCase();

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
              isActive
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white/80 text-stone-600 border border-stone-200/80 hover:bg-stone-100"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}