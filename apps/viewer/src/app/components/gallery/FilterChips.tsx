"use client";

import { useEffect, useState } from "react";

type Props = {
  active: string;
  onChange: (value: string) => void;
  counts?: Record<string, number>;
  galleryType?: string;
  categories?: string[];
};

export default function FilterChips({ active, onChange, counts = {}, categories: propCategories }: Props) {
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      const filtered = Array.from(new Set(["All", ...propCategories])).filter(Boolean);
      setCategories(filtered);
      return;
    }

    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (s) {
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`)
          .then((r) => r.json())
          .then((d) => {
            const rawCats = d?.event?.categoriesList || d?.event?.photoCategories || [];
            const formatted = rawCats
              .map((item: any) => (typeof item === "string" ? item : item.name || item.title || ""))
              .map((str: string) => str.trim())
              .filter(Boolean);

            setCategories(Array.from(new Set(["All", ...formatted])));
          })
          .catch(() => {});
      }
    }
  }, [propCategories]);

  return (
    <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-2">
      {categories.map((cat) => {
        const isActive = active.trim().toLowerCase() === cat.trim().toLowerCase();
        const count = counts[cat] !== undefined ? counts[cat] : (counts[cat.toLowerCase()] || 0);

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              isActive
                ? "bg-stone-900 text-white shadow-xs"
                : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            <span>{cat}</span>
            {cat === "All" && counts["All"] !== undefined && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"}`}>
                {counts["All"]}
              </span>
            )}
            {cat !== "All" && count > 0 && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
