"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Flame, Download } from "lucide-react";

export default function TrendingSection() {
  const [slug, setSlug] = useState("");
  const [trendingData, setTrendingData] = useState({
    loved: "Highlights",
    viewed: "Moments",
    downloaded: "Albums",
    lovedCategory: "",
    viewedCategory: "",
    downloadedCategory: "",
  });

  useEffect(() => {
    async function loadTrending() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        setSlug(activeSlug);

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        
        if (json?.success && json?.event) {
          const photos = Array.isArray(json.event.photos) ? json.event.photos : [];
          
          // Find most liked
          const sortedByLikes = [...photos].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
          const mostLoved = sortedByLikes[0];

          // Find most viewed
          const sortedByViews = [...photos].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
          const mostViewed = sortedByViews[0];

          // Find most downloaded
          const sortedByDownloads = [...photos].sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));
          const mostDownloaded = sortedByDownloads[0];

          setTrendingData({
            loved: mostLoved?.caption || mostLoved?.category || "Highlights",
            viewed: mostViewed?.caption || mostViewed?.category || "Moments",
            downloaded: mostDownloaded?.caption || mostDownloaded?.category || "Albums",
            lovedCategory: mostLoved?.category || "",
            viewedCategory: mostViewed?.category || "",
            downloadedCategory: mostDownloaded?.category || "",
          });
        }
      } catch (err) {
        console.error("Trending load error:", err);
      }
    }
    loadTrending();
  }, []);

  const items = [
    {
      title: "Most Loved",
      subtitle: trendingData.loved,
      category: trendingData.lovedCategory,
      icon: Heart,
      color: "from-pink-500 to-rose-400",
    },
    {
      title: "Most Viewed",
      subtitle: trendingData.viewed,
      category: trendingData.viewedCategory,
      icon: Flame,
      color: "from-orange-500 to-amber-400",
    },
    {
      title: "Most Downloaded",
      subtitle: trendingData.downloaded,
      category: trendingData.downloadedCategory,
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
          const targetUrl = item.category
            ? `/gallery?category=${encodeURIComponent(item.category.toLowerCase())}&event=${encodeURIComponent(slug)}`
            : `/gallery?event=${encodeURIComponent(slug)}`;

          return (
            <Link
              key={idx}
              href={targetUrl}
              className={`rounded-2xl bg-gradient-to-br ${item.color} p-3 text-white shadow-md transition hover:scale-105 block`}
            >
              <Icon size={20} />
              <p className="mt-2 text-xs font-semibold">{item.title}</p>
              <p className="text-[10px] text-white/80 truncate">{item.subtitle}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}