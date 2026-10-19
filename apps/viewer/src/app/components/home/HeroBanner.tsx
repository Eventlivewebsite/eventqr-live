"use client";

import { useEffect, useState } from "react";
import { Play, Heart, MapPin, X } from "lucide-react";

export default function HeroBanner() {
  const [data, setData] = useState({
    title: "",
    location: "",
    heroTag: "LIVE EVENT",
    ceremonyName: "Main Ceremony",
    bannerPhotos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"
    ],
    highlightVideoUrl: "",
    targetDate: null as Date | null,
  });

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 36 });

  useEffect(() => {
    async function loadHero() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        
        if (json?.success && json?.event) {
          const ev = json.event;
          const photos = (ev.photos && ev.photos.length > 0)
            ? ev.photos.map((p: any) => p.url)
            : ["https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"];

          setData({
            title: ev.title || "A & S Wedding",
            location: ev.location || "Jaipur Palace",
            heroTag: ev.customMap?.heroTag || "LIVE EVENT",
            ceremonyName: "Wedding Reception",
            bannerPhotos: photos,
            highlightVideoUrl: (ev.videos && ev.videos[0]?.url) || "",
            targetDate: ev.eventDate ? new Date(ev.eventDate) : null,
          });
        }
      } catch (e) {
        console.error("Failed to load hero banner", e);
      }
    }
    loadHero();
  }, []);

  useEffect(() => {
    if (data.bannerPhotos.length <= 1) return;
    const slideTimer = setInterval(() => {
      setActivePhotoIdx(prev => (prev + 1) % data.bannerPhotos.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, [data.bannerPhotos]);

  useEffect(() => {
    const updateCountdown = () => {
      if (!data.targetDate || isNaN(data.targetDate.getTime())) return;
      const now = new Date().getTime();
      const difference = data.targetDate.getTime() - now;
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data.targetDate]);

  const padZero = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="relative mx-3.5 mt-2">
      {/* Exact First Image Card Structure */}
      <div className="relative h-[360px] w-full overflow-hidden rounded-[2rem] shadow-xl">
        {data.bannerPhotos.map((photo, idx) => (
          <img
            key={idx}
            src={photo}
            alt="Cover"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              idx === activePhotoIdx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Soft Radial & Linear Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

        {/* Inner Padding & Content */}
        <div className="relative flex h-full flex-col justify-between p-5 text-white">
          {/* Top Live Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
              <span className="h-2 w-2 rounded-full bg-white" />
              {data.heroTag}
            </span>
          </div>

          <div className="space-y-3">
            {/* Title & Location */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white capitalize drop-shadow">
                {data.title}
              </h2>
              {data.location && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-stone-200 capitalize">
                  <MapPin className="h-3.5 w-3.5 text-stone-300" />
                  {data.location}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (data.highlightVideoUrl) setShowVideoModal(true);
                  else alert("Live highlights will begin shortly!");
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-2.5 px-4 text-xs font-bold text-stone-900 shadow transition hover:bg-stone-100 active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-stone-900" />
                Watch Highlights
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("timeline-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/30 py-2.5 px-4 text-xs font-bold text-white backdrop-blur-md transition hover:bg-black/50 active:scale-95"
              >
                <Heart className="h-3.5 w-3.5" />
                Our Story
              </button>
            </div>

            {/* Bottom Ceremony & Countdown Strip (Exact Structure) */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 backdrop-blur-md">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  CEREMONY
                </p>
                <p className="text-sm font-bold text-white">
                  {data.ceremonyName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Starts In
                </p>
                <p className="font-mono text-base font-bold tracking-wider text-white">
                  {padZero(timeLeft.hours)} : {padZero(timeLeft.minutes)} : {padZero(timeLeft.seconds)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-black">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={data.highlightVideoUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
