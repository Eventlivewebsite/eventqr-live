"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function CategoriesSection() {
  const [categories, setCategories] = useState<string[]>([
    "Ceremony", "Haldi", "Mehendi", "Reception", "Family", "Party"
  ]);

  useEffect(() => {
    async function loadCats() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && Array.isArray(json?.event?.categoriesList) && json.event.categoriesList.length > 0) {
          setCategories(json.event.categoriesList);
        }
      } catch {}
    }
    loadCats();
  }, []);

  return (
    <section className="mt-8 px-5">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="text-amber-500" size={22} />
        <h2 className="text-xl font-bold">Categories</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}