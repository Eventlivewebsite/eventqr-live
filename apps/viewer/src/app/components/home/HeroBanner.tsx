"use client";

import { useEffect, useState } from "react";
import { Play, Heart, MapPin, X } from "lucide-react";

export default function HeroBanner() {
  const [data, setData] = useState({
    title: "Event Celebration",
    location: "Venue Location",
    heroTag: "LIVE EVENT",
    bannerPhotos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"
    ],
    highlightVideoUrl: "",
    ourStoryText: "",
    ceremonyName: "Main Ceremony",
    targetDate: null as Date | null,
  });

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    async function loadHero() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        
        if (json?.success && json?.event) {
          const ev = json.event;
          const photos = Array.isArray(ev.highlightPhotos) && ev.highlightPhotos.length > 0
            ? ev.highlightPhotos
            : (ev.photos && ev.photos.length > 0 ? ev.photos.slice(0, 5).map((p: any) => p.url) : [
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"
              ]);

          // Next upcoming timeline or main event date
          let upcomingName = "Main Celebration";
          let target = ev.eventDate ? new Date(ev.eventDate) : null;

          if (Array.isArray(ev.timelines) && ev.timelines.length > 0) {
            const liveItem = ev.timelines.find((t: any) => t.status === "LIVE");
            const upcomingItem = ev.timelines.find((t: any) => t.status === "UPCOMING");
            const activeItem = liveItem || upcomingItem || ev.timelines[0];
            if (activeItem) {
              upcomingName = activeItem.title;
            }
          }

          setData({
            title: ev.title || "Event Celebration",
            location: ev.location || "Venue Location",
            heroTag: "LIVE EVENT",
            bannerPhotos: photos,
            highlightVideoUrl: (ev.videos && ev.videos[0]?.url) || "",
            ourStoryText: ev.subtitle || "Welcome to our special day! Thank you for joining our celebration.",
            ceremonyName: upcomingName,
            targetDate: target,
          });
        }
      } catch (e) {
        console.error("Failed to load hero banner data", e);
      }
    }
    loadHero();
  }, []);

  // Background slideshow effect
  useEffect(() => {
    if (data.bannerPhotos.length <= 1) return;
    const slideTimer = setInterval(() => {
      setActivePhotoIdx(prev => (prev + 1) % data.bannerPhotos.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, [data.bannerPhotos]);

  // Real Countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (!data.targetDate || isNaN(data.targetDate.getTime())) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const now = new Date().getTime();
      const diff = data.targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [data.targetDate]);

  const formatNum = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <section className="relative h-80 overflow-hidden rounded-[28px] m-4">
        {/* Dynamic Background Slideshow */}
        {data.bannerPhotos.map((url, idx) => (
          <img
            key={url + idx}
            src={url}
            alt="Event Highlight"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              idx === activePhotoIdx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

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
                if (data.highlightVideoUrl) {
                  window.open(data.highlightVideoUrl, "_blank");
                } else {
                  const galleryEl = document.getElementById("gallery-section");
                  if (galleryEl) galleryEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-black transition hover:scale-105"
            >
              <Play size={18} fill="black" />
              Watch Highlights
            </button>

            <button
              onClick={() => setShowStoryModal(true)}
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-white backdrop-blur-md transition hover:bg-white/20"
            >
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

      {/* Our Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute right-4 top-4 rounded-full bg-stone-100 p-2 text-stone-500 hover:bg-stone-200"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 text-rose-500">
              <Heart size={20} fill="currentColor" />
              <h3 className="text-lg font-bold text-stone-900">Our Story</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-600 whitespace-pre-wrap">
              {data.ourStoryText}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
