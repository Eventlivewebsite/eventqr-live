"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function CategoriesSection() {
  const [slug, setSlug] = useState("testing-nns3");
  const [categories, setCategories] = useState<string[]>([
    "Ceremony",
    "Haldi",
    "Mehendi",
    "Reception",
    "Family",
    "Party",
  ]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        setSlug(activeSlug);

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        
        if (json?.success && json?.event) {
          const fetchedCats = Array.isArray(json.event.photoCategories) && json.event.photoCategories.length > 0
            ? json.event.photoCategories
            : (Array.isArray(json.event.categoriesList) && json.event.categoriesList.length > 0
                ? json.event.categoriesList
                : null);

          if (fetchedCats) {
            setCategories(fetchedCats);
          }
        }
      } catch (err) {
        console.error("Categories load error:", err);
      }
    }
    loadCategories();
  }, []);

  return (
    <section className="px-5 pt-3">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={20} className="text-[#c68936]" />
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/gallery?category=${encodeURIComponent(cat.toLowerCase())}&event=${encodeURIComponent(slug)}`}
            className="rounded-full border border-amber-200/80 bg-white/90 px-4 py-2 text-xs font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100/70 hover:scale-105 active:scale-95"
          >
            {cat}
          </Link>
        ))}
      </div>
    </section>
  );
}