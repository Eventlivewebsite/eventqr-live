"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart, MapPin, Radio } from "lucide-react";

export default function HeroBanner() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("Live Event");
  const [subtitle, setSubtitle] = useState("Forever Begins Today");
  const [location, setLocation] = useState("Kharagpur");
  const [coverUrl, setCoverUrl] = useState("/images/hero-couple.jpg");

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
          if (ev.customMap?.coverImage || ev.customMap?.bannerImage) {
            setCoverUrl(ev.customMap.coverImage || ev.customMap.bannerImage);
          }
        }
      } catch (err) {
        console.error("HeroBanner load error", err);
      }
    }
    loadData();
  }, []);

  return (
    <section className="px-3.5 pt-2">
      <div className="relative overflow-hidden rounded-[28px] bg-stone-950 p-4 pt-4 shadow-xl border border-stone-800">
        {/* Background Image with Ambient Glow */}
        <div className="absolute inset-0 z-0">
          <Image
            src={coverUrl}
            alt="Event Cover"
            fill
            priority
            className="object-cover opacity-45 scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        </div>

        {/* Live Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/90 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs backdrop-blur-xs">
            <Radio size={11} className="animate-pulse text-white" />
            Live Event
          </div>
        </div>

        {/* Content: Title & Location (Flexible Wrap, no cut) */}
        <div className="relative z-10 mt-14 mb-3">
          <h1 className="text-2xl font-black tracking-tight text-white leading-tight break-words">
            {title}
          </h1>
          <p className="text-xs font-medium text-stone-300 mt-0.5 break-words line-clamp-2">
            {subtitle}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-300 break-words">
            <MapPin size={12} className="flex-shrink-0 text-amber-400" />
            <span>{location}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-3">
          <Link
            href={`/videos?slug=${encodeURIComponent(slug)}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-stone-950 shadow-md transition hover:bg-stone-100 active:scale-95"
          >
            <Play size={13} className="fill-stone-950" />
            Watch Highlights
          </Link>
          <Link
            href={`/invitation?slug=${encodeURIComponent(slug)}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
          >
            <Heart size={13} className="text-rose-400 fill-rose-400" />
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}