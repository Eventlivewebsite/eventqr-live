"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Camera, Video, Images } from "lucide-react";
import PremiumCard from "../ui/PremiumCard";
import Link from "next/link";

export default function GallerySection() {
  const [slug, setSlug] = useState("");
  const [photoCount, setPhotoCount] = useState("View Gallery");
  const [videoCount, setVideoCount] = useState("All Videos");

  useEffect(() => {
    async function loadCounts() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        setSlug(activeSlug);

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && json?.event) {
          const photos = Array.isArray(json.event.photos) ? json.event.photos : [];
          const videos = Array.isArray(json.event.videos) ? json.event.videos : [];

          setPhotoCount(photos.length > 0 ? `${photos.length} Photos` : "View Gallery");
          setVideoCount(videos.length > 0 ? `${videos.length} Videos` : "All Videos");
        }
      } catch (err) {
        console.error("GallerySection count error:", err);
      }
    }
    loadCounts();
  }, []);

  return (
    <section className="px-3.5 pt-1">
      <div className="mb-2 flex items-center gap-1.5">
        <Images className="h-4 w-4 text-amber-600" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
          Gallery
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Link href={`/gallery?event=${encodeURIComponent(slug)}`}>
          <PremiumCard className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br from-[#fffdf9] via-[#fff5eb] to-[#ffe6cf] p-3.5 shadow-sm transition-all duration-300 active:scale-95">
            <div className="relative flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-orange-500 shadow-xs backdrop-blur-md">
                <Camera size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-stone-400 transition-transform group-hover:translate-x-0.5"
              />
            </div>

            <h3 className="mt-2.5 text-sm font-bold text-stone-900 leading-tight">
              Photos
            </h3>

            <p className="mt-0.5 text-[11px] font-medium text-stone-500">
              {photoCount}
            </p>

            <div className="mt-2.5 flex items-center justify-between pt-1">
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                Live
              </span>
              <span className="text-[11px] font-bold text-orange-600">
                Explore
              </span>
            </div>
          </PremiumCard>
        </Link>

        <Link href={`/videos?event=${encodeURIComponent(slug)}`}>
          <PremiumCard className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br from-[#faf8ff] via-[#f1ecff] to-[#e5dcff] p-3.5 shadow-sm transition-all duration-300 active:scale-95">
            <div className="relative flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-violet-500 shadow-xs backdrop-blur-md">
                <Video size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-stone-400 transition-transform group-hover:translate-x-0.5"
              />
            </div>

            <h3 className="mt-2.5 text-sm font-bold text-stone-900 leading-tight">
              Videos
            </h3>

            <p className="mt-0.5 text-[11px] font-medium text-stone-500">
              {videoCount}
            </p>

            <div className="mt-2.5 flex items-center justify-between pt-1">
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                Live
              </span>
              <span className="text-[11px] font-bold text-violet-600">
                Explore
              </span>
            </div>
          </PremiumCard>
        </Link>
      </div>
    </section>
  );
}