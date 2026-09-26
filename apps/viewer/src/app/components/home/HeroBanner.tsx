"use client";

import { useEffect, useState } from "react";
import { Play, Heart, MapPin } from "lucide-react";

export default function HeroBanner() {
  const [data, setData] = useState({
    title: "A & S Wedding",
    location: "Jaipur Palace",
    bannerUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    heroTag: "LIVE EVENT",
    highlightUrl: "",
  });

  useEffect(() => {
    async function loadHero() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";

        let res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        let json = res ? await res.json().catch(() => null) : null;

        if (json?.success && json?.event) {
          setData({
            title: json.event.title || "Celebration",
            location: json.event.location || "Grand Palace",
            bannerUrl: json.event.heroBannerUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
            heroTag: json.event.heroTag || "LIVE EVENT",
            highlightUrl: json.event.highlightVideoUrl || "",
          });
        }
      } catch (e) {
        console.error("Hero load error:", e);
      }
    }
    loadHero();
  }, []);

  return (
    <section className="relative h-80 overflow-hidden rounded-[28px]">
      {/* Background */}
      <img
        src={data.bannerUrl}
        alt={data.title}
        className="h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* LIVE Badge */}
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        {data.heroTag}
      </div>

      {/* Content */}
      <div className="absolute bottom-6 left-5 right-5">
        <h1 className="mt-1 text-2xl font-bold text-white">
          {data.title}
        </h1>

        <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
          <MapPin size={16} />
          {data.location}
        </div>

        <div className="mt-5 flex gap-3">
          <button 
            onClick={() => {
              if (data.highlightUrl) window.open(data.highlightUrl, "_blank");
            }}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-black transition hover:scale-105"
          >
            <Play size={18} fill="black" />
            Watch Highlights
          </button>

          <button className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-white backdrop-blur-md transition hover:bg-white/20">
            <Heart size={18} />
            Our Story
          </button>
        </div>
      </div>
    </section>
  );
}