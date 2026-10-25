"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart, MapPin, Radio, Calendar } from "lucide-react";

export default function HeroBanner() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [location, setLocation] = useState("");
  const [highlightType, setHighlightType] = useState<"video" | "photos">("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ceremonyName, setCeremonyName] = useState("");
  const [ourStoryUrl, setOurStoryUrl] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const sp = new URLSearchParams(window.location.search);
        let s = sp.get("event") || sp.get("slug") || "";
        if (!s && typeof window !== "undefined") {
          s = sessionStorage.getItem("active_event_slug") || "";
        }
        if (s) {
          setSlug(s);
          sessionStorage.setItem("active_event_slug", s);
        }

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(s)}&_t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && json?.event) {
          const ev = json.event;
          if (ev.title) setTitle(ev.title);
          if (ev.subtitle) setSubtitle(ev.subtitle);
          if (ev.location) setLocation(ev.location);
          if (ev.ceremonyName) setCeremonyName(ev.ceremonyName);
          if (ev.ourStoryUrl) setOurStoryUrl(ev.ourStoryUrl);
          if (ev.highlightType) setHighlightType(ev.highlightType);
          if (ev.highlightVideoUrl) setVideoUrl(ev.highlightVideoUrl);
          
          if (Array.isArray(ev.highlightPhotos) && ev.highlightPhotos.length > 0) {
            setPhotos(ev.highlightPhotos);
          } else {
            // Default slides
            setPhotos([
              "/images/hero-couple.jpg",
              "/images/trending-love.jpg",
              "/images/trending-view.jpg",
              "/images/hero-couple.jpg"
            ]);
          }
        }
      } catch (err) {
        console.error("HeroBanner load error", err);
      }
    }
    loadData();
  }, []);

  // 3-Second Loop Slideshow Timer
  useEffect(() => {
    if (highlightType === "photos" && photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % photos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [highlightType, photos.length]);

  return (
    <section className="px-3.5 pt-2">
      <div className="relative overflow-hidden rounded-[30px] bg-stone-950 p-4 pt-4 shadow-xl border border-stone-800">
        
        {/* Background Media Engine */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {highlightType === "video" && videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover opacity-60 scale-105"
            />
          ) : (
            <div className="relative h-full w-full">
              {(photos.length > 0 ? photos : ["/images/hero-couple.jpg"]).map((src, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlide ? "opacity-60 scale-105 transition-transform duration-[4000ms]" : "opacity-0"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`Hero slide ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          {/* Ambient Film Vignette / Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-black/30" />
        </div>

        {/* Live Badge & Slideshow Indicators */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/90 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs backdrop-blur-xs">
            <Radio size={11} className="animate-pulse text-white" />
            Live Event
          </div>

          {highlightType === "photos" && photos.length > 1 && (
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? "w-4 bg-amber-400" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Main Headings: Wrap safe for long titles */}
        {/* Main Headings: Clean, compact & background slideshow friendly */}
          <div className="relative z-10 mt-8 mb-2 px-1">
            <h1 className="text-lg sm:text-xl font-bold tracking-normal text-white/95 leading-tight break-words whitespace-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-[12px] font-serif italic tracking-widest text-amber-100/90 mt-0.5 break-words uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                ? {subtitle} ?
              </p>
            )}
            {location && (
              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-amber-300/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                <MapPin size={11} className="flex-shrink-0 text-amber-400" />
                <span className="break-words">{location}</span>
              </div>
            )}
          </div>

        {/* Action Buttons */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-2">
          <Link
            href={`/videos?slug=${encodeURIComponent(slug)}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-stone-950 shadow-md transition hover:bg-stone-100 active:scale-95"
          >
            <Play size={13} className="fill-stone-950" />
            Watch Highlights
          </Link>

          {ourStoryUrl ? (
            <a
              href={ourStoryUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              <Heart size={13} className="text-rose-400 fill-rose-400" />
              Our Story
            </a>
          ) : (
            <Link
              href={`/invitation?slug=${encodeURIComponent(slug)}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              <Heart size={13} className="text-rose-400 fill-rose-400" />
              Our Story
            </Link>
          )}
        </div>

        {/* Countdown / Ceremony Card Bar */}
        <div className="relative z-10 mt-3 rounded-2xl border border-amber-500/30 bg-black/50 p-2.5 px-3 backdrop-blur-md flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Calendar size={14} />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-amber-400/90 block leading-none">Ceremony</span>
              <span className="text-xs font-bold text-stone-100 leading-tight block mt-0.5 break-words max-w-[200px]">{ceremonyName || "Main Ceremony"}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-stone-400 block leading-none">Status</span>
            <span className="text-xs font-black text-emerald-400 leading-tight block mt-0.5">Celebration Active</span>
          </div>
        </div>

      </div>
    </section>
  );
}