"use client";

import { useEffect, useState } from "react";
import { Heart, Flame, Download, ArrowRight } from "lucide-react";

export default function TrendingSection() {
  const [subtitles, setSubtitles] = useState({
    loved: "Wedding Highlights",
    viewed: "Haldi Moments",
    downloaded: "Reception Album",
  });

  useEffect(() => {
    async function loadTrending() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && json?.event) {
          setSubtitles({
            loved: json.event.trendingLoved || "Highlights",
            viewed: json.event.trendingViewed || "Moments",
            downloaded: json.event.trendingDownloaded || "Album",
          });
        }
      } catch {}
    }
    loadTrending();
  }, []);

  const items = [
    {
      title: "Most Loved",
      subtitle: subtitles.loved,
      icon: Heart,
      color: "from-pink-500 to-rose-400",
    },
    {
      title: "Most Viewed",
      subtitle: subtitles.viewed,
      icon: Flame,
      color: "from-orange-500 to-amber-400",
    },
    {
      title: "Most Downloaded",
      subtitle: subtitles.downloaded,
      icon: Download,
      color: "from-blue-500 to-cyan-400",
    },
  ];

  return (
    <section className="px-5 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🔥 Trending</h2>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl bg-gradient-to-br ${item.color} p-3 text-white shadow-md transition hover:scale-105`}
            >
              <Icon size={20} />
              <p className="mt-2 text-xs font-semibold">{item.title}</p>
              <p className="text-[10px] text-white/80 truncate">{item.subtitle}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}