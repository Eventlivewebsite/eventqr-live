"use client";

import { useState, useEffect } from "react";

interface VideoFilterProps {
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export default function VideoFilter({ activeCategory = "All", onSelectCategory }: VideoFilterProps) {
  const [selected, setSelected] = useState(activeCategory);
  const [categories, setCategories] = useState<string[]>(["All", "Ceremony", "Stage", "Celebrations", "Family"]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (s) {
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`)
          .then((r) => r.json())
          .then((d) => {
            const list = d?.event?.videoCategories || d?.event?.photoCategories;
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
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2">
      {categories.map((cat) => {
        const isActive = (activeCategory || selected) === cat;
        return (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition active:scale-95 ${
              isActive
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
