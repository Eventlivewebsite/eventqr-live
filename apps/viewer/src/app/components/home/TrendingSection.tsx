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

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        
        if (json?.success && json?.event) {
          const photos = Array.isArray(json.event.photos) ? json.event.photos : [];
          
          const sortedByLikes = [...photos].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
          const mostLoved = sortedByLikes[0];

          const sortedByViews = [...photos].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
          const mostViewed = sortedByViews[0];

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
      bgGradient: "linear-gradient(135deg, #ec4899, #f43f5e, #fb7185, #ec4899)",
      shadowColor: "shadow-[0_8px_20px_rgba(244,63,94,0.30)]",
    },
    {
      title: "Most Viewed",
      subtitle: trendingData.viewed,
      category: trendingData.viewedCategory,
      icon: Flame,
      bgGradient: "linear-gradient(135deg, #f97316, #f59e0b, #fbbf24, #f97316)",
      shadowColor: "shadow-[0_8px_20px_rgba(249,115,22,0.30)]",
    },
    {
      title: "Most Downloaded",
      subtitle: trendingData.downloaded,
      category: trendingData.downloadedCategory,
      icon: Download,
      bgGradient: "linear-gradient(135deg, #0284c7, #06b6d4, #38bdf8, #0284c7)",
      shadowColor: "shadow-[0_8px_20px_rgba(2,132,199,0.30)]",
    },
  ];

  return (
    <section className="px-3.5 mt-3">
      {/* Continuous soft shifting animated light inside cards */}
      <style jsx>{`
        @keyframes softLightShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animated-card-glow {
          background-size: 250% 250% !important;
          animation: softLightShift 5s ease-in-out infinite;
        }
        @keyframes innerAuraGlow {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.1);
          }
        }
        .inner-aura {
          animation: innerAuraGlow 3.5s ease-in-out infinite;
        }
      `}</style>

      <div className="mb-2 flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
          Trending
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const targetUrl = item.category
            ? `/gallery?category=${encodeURIComponent(item.category.toLowerCase())}&event=${encodeURIComponent(slug)}`
            : `/gallery?event=${encodeURIComponent(slug)}`;

          return (
            <Link
              key={idx}
              href={targetUrl}
              style={{ background: item.bgGradient }}
              className={`animated-card-glow relative overflow-hidden rounded-2xl p-3 text-white ${item.shadowColor} transition-transform duration-200 active:scale-95 block`}
            >
              {/* Inner ambient soft light pulse */}
              <div className="inner-aura absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white blur-xl pointer-events-none" />
              <div className="inner-aura absolute -left-4 -bottom-4 h-14 w-14 rounded-full bg-white/40 blur-lg pointer-events-none" />

              <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Icon size={16} className="text-white" />
              </div>
              
              <p className="relative z-10 mt-2.5 text-[11px] font-extrabold leading-tight text-white drop-shadow-xs">
                {item.title}
              </p>
              <p className="relative z-10 mt-0.5 text-[10px] font-medium text-white/85 truncate drop-shadow-xs">
                {item.subtitle}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}