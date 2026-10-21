"use client";

import { useState, useEffect } from "react";

interface FilterChipsProps {
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export default function FilterChips({ activeCategory = "All", onSelectCategory }: FilterChipsProps) {
  const [selected, setSelected] = useState(activeCategory);
  const [categories, setCategories] = useState<string[]>([
    "All", "Ceremony", "Stage", "Celebrations", "Family"
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
            const list = d?.event?.photoCategories;
            if (Array.isArray(list) && list.length > 0) {
              setCategories(["All", ...list]);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const handleClick = (cat: string) => {
    setSelected(cat);
    if (onSelectCategory) onSelectCategory(cat);
  };

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2.5">
      {categories.map((cat) => {
        const isActive = (activeCategory || selected) === cat;
        return (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className={`relative whitespace-nowrap rounded-2xl px-5 py-2 text-xs font-bold transition-all duration-300 active:scale-95 ${
              isActive
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white shadow-[0_6px_16px_rgba(217,119,6,0.35)] scale-105"
                : "bg-white/80 text-stone-600 hover:text-stone-900 border border-stone-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-white"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
