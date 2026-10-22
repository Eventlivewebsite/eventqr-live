"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function CategoriesSection() {
  const [slug, setSlug] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        setSlug(activeSlug);

        // Check local session cache first
        try {
          const cached = sessionStorage.getItem("cached_event_data_" + activeSlug);
          if (cached) {
            const p = JSON.parse(cached);
            const cats = p.categoriesList || p.photoCategories || p.customMap?.photoCategories || p.customMap?.activeCategories;
            if (Array.isArray(cats) && cats.length > 0) {
              setCategories(cats.map((c: any) => typeof c === "string" ? c : c?.name || "").filter(Boolean));
            }
          }
        } catch {}

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store", headers: { "Pragma": "no-cache" } });
        const json = await res.json();
        
        if (json?.success && json?.event) {
          const ev = json.event;
          const fetchedCats = (Array.isArray(ev.categoriesList) && ev.categoriesList.length > 0)
            ? ev.categoriesList
            : ((Array.isArray(ev.photoCategories) && ev.photoCategories.length > 0)
                ? ev.photoCategories
                : (Array.isArray(ev.customMap?.photoCategories) ? ev.customMap.photoCategories : null));

          if (Array.isArray(fetchedCats) && fetchedCats.length > 0) {
            const cleaned = fetchedCats.map((c: any) => typeof c === "string" ? c : c?.name || "").filter(Boolean);
            if (cleaned.length > 0) {
              setCategories(cleaned);
            }
          }
        }
      } catch (err) {
        console.error("Categories load error:", err);
      }
    }
    loadCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="px-3.5 mt-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500 fill-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Categories
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/gallery?category=${encodeURIComponent(cat.toLowerCase())}&event=${encodeURIComponent(slug)}`}
            className="rounded-full border border-amber-200/90 bg-white/95 px-3.5 py-1.5 text-[11px] font-bold text-amber-950 shadow-[0_2px_8px_rgba(245,158,11,0.08)] transition-all duration-200 hover:border-amber-400 hover:bg-amber-50/80 active:scale-95"
          >
            {cat}
          </Link>
        ))}
      </div>
    </section>
  );
}