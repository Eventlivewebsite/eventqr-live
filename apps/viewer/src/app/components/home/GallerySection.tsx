"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Camera, Video } from "lucide-react";
import PremiumCard from "../ui/PremiumCard";
import Link from "next/link";

export default function GallerySection() {
  const [photoCount, setPhotoCount] = useState("Explore");
  const [videoCount, setVideoCount] = useState("Explore");

  useEffect(() => {
    async function loadCounts() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && json?.event) {
          if (Array.isArray(json.event.videosList) && json.event.videosList.length > 0) {
            setVideoCount(`${json.event.videosList.length} Videos`);
          } else {
            setVideoCount("All Videos");
          }
          if (Array.isArray(json.event.albums) && json.event.albums.length > 0) {
            setPhotoCount("Browse Albums");
          } else {
            setPhotoCount("View Gallery");
          }
        }
      } catch {}
    }
    loadCounts();
  }, []);

  return (
    <section className="p-5">
      <h2 className="mb-4 text-xl font-bold">
        📸 Gallery
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Photos Card */}
        <Link href="/gallery">
          <PremiumCard className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-[#fffdf9] via-[#fff5eb] to-[#ffe6cf] shadow-[0_10px_18px_rgba(255,175,100,0.12),0_28px_60px_rgba(255,175,100,0.20),inset_0_2px_0_rgba(255,255,255,0.95)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(255,175,100,0.20),0_35px_70px_rgba(255,175,100,0.30),inset_0_2px_0_rgba(255,255,255,1)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-200/30 blur-3xl" />
            <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-pink-200/20 blur-3xl" />

            <div className="relative flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-orange-500 shadow-lg backdrop-blur-xl">
                <Camera size={28} />
              </div>
              <ArrowRight
                size={20}
                className="text-gray-400 transition-all duration-300 group-hover:translate-x-1"
              />
            </div>

            <h3 className="relative mt-5 text-lg font-bold text-gray-900">
              Photos
            </h3>

            <p className="relative mt-1 text-sm text-gray-600">
              {photoCount}
            </p>

            <div className="relative mt-5 flex items-center justify-between">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Live
              </span>
              <span className="text-sm font-semibold text-orange-500">
                Explore
              </span>
            </div>
          </PremiumCard>
        </Link>

        {/* Videos Card */}
        <Link href="/videos">
          <PremiumCard className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-[#faf8ff] via-[#f1ecff] to-[#e5dcff] shadow-[0_10px_18px_rgba(145,120,255,0.12),0_28px_60px_rgba(145,120,255,0.20),inset_0_2px_0_rgba(255,255,255,0.95)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(145,120,255,0.20),0_35px_70px_rgba(145,120,255,0.30),inset_0_2px_0_rgba(255,255,255,1)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl" />
            <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-pink-200/20 blur-3xl" />

            <div className="relative flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-violet-500 shadow-lg backdrop-blur-xl">
                <Video size={28} />
              </div>
              <ArrowRight
                size={20}
                className="text-gray-400 transition-all duration-300 group-hover:translate-x-1"
              />
            </div>

            <h3 className="relative mt-5 text-lg font-bold text-gray-900">
              Videos
            </h3>

            <p className="relative mt-1 text-sm text-gray-600">
              {videoCount}
            </p>

            <div className="relative mt-5 flex items-center justify-between">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Live
              </span>
              <span className="text-sm font-semibold text-violet-500">
                Explore
              </span>
            </div>
          </PremiumCard>
        </Link>
      </div>
    </section>
  );
}