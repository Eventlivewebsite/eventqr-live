import { useState, useEffect } from "react";
"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const filters = [
  "All",
  "Wedding",
  "Haldi",
  "Mehendi",
  "Reception",
];

type Props = {
  active: string;
  onChange: (value: string) => void;
  counts: Record<string, number>;

  // New
  galleryType?: string;
};

export default function FilterChips({

  const [categories, setCategories] = useState<string[]>(["All", "Ceremony", "Stage", "Celebrations", "Family"]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (s) {
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`)
          .then(r => r.json())
          .then(d => {
            if (d?.event?.photoCategories && Array.isArray(d.event.photoCategories) && d.event.photoCategories.length > 0) {
              setCategories(["All", ...d.event.photoCategories]);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  active,
  onChange,
  counts,
  galleryType = "default",
}: Props) {
  const router = useRouter();

  // Category Gallery
  if (galleryType !== "default") {
    return (
      <div className="mt-5 flex gap-3 overflow-x-auto no-scrollbar">

        <button
          onClick={() => router.push("/gallery")}
          className="flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
        >
          <ArrowLeft size={16} />
          Back Gallery
        </button>

        <button className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-lg">
          {galleryType
            .split("-")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
            )
            .join(" ")}
        </button>

      </div>
    );
  }

  // Main Gallery
  return (
    <div className="mt-5 flex gap-3 overflow-x-auto no-scrollbar">

      {filters.map((filter) => (

        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
            active === filter
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">

            <span>{filter}</span>

            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${
                active === filter
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {counts[filter] ?? 0}
            </span>

          </div>
        </button>

      ))}

    </div>
  );
}