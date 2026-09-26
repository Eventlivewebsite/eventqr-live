"use client";

import { useEffect, useState } from "react";
import { Play, Heart, MapPin } from "lucide-react";

export default function HeroBanner() {
  const [data, setData] = useState({
    title: "A & S Wedding",
    location: "Jaipur Palace",
    heroTag: "LIVE EVENT",
    bannerUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    highlightVideoUrl: "",
    ceremonyName: "Wedding Reception",
  });

  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 36 });

  useEffect(() => {
    async function loadHero() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && json?.event) {
          setData(prev => ({
            ...prev,
            title: json.event.title || prev.title,
            location: json.event.location || prev.location,
            heroTag: json.event.heroTag || prev.heroTag,
            bannerUrl: (json.event.highlightPhotos && json.event.highlightPhotos[0]) || json.event.heroBannerUrl || prev.bannerUrl,
            highlightVideoUrl: json.event.highlightVideoUrl || "",
          }));
        }
      } catch {}
    }
    loadHero();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNum = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="relative h-80 overflow-hidden rounded-[28px] m-4">
      {/* Background */}
      <img
        src={data.bannerUrl}
        alt="Wedding"
        className="h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* LIVE Badge */}
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        {data.heroTag || "LIVE EVENT"}
      </div>

      {/* Content */}
      <div className="absolute bottom-6 left-5 right-5">
        <h1 className="mt-1 text-2xl font-bold text-white drop-shadow">
          {data.title}
        </h1>

        <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
          <MapPin size={16} />
          {data.location}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              if (data.highlightVideoUrl) window.open(data.highlightVideoUrl, "_blank");
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

        {/* Ceremony Countdown Box */}
        <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/70">
                Ceremony
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                {data.ceremonyName}
              </h3>
            </div>

            <div className="text-right">
              <p className="text-xs text-white/70">Starts In</p>
              <h2 className="text-xl font-bold text-white">
                {formatNum(timeLeft.hours)} : {formatNum(timeLeft.minutes)} : {formatNum(timeLeft.seconds)}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}