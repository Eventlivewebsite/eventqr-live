"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Flame, Download } from "lucide-react";

export default function TrendingSection() {
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      let s = sp.get("event") || sp.get("slug") || "";
      if (!s) s = sessionStorage.getItem("active_event_slug") || "";
      if (s) {
        setSlug(s);
        sessionStorage.setItem("active_event_slug", s);
      }
    }
  }, []);

  const eventParam = slug ? `?event=${encodeURIComponent(slug)}` : "";

  return (
    <section className="px-5 py-2">
      <div className="flex items-center gap-1.5 mb-3">
        <Flame size={16} className="text-orange-500 fill-orange-500" />
        <h3 className="text-xs font-black tracking-wider text-stone-800 uppercase">
          Trending
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Most Loved */}
        <Link
          href={`/gallery${eventParam}${eventParam ? "&" : "?"}sort=most_loved`}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-3.5 text-white shadow-sm transition active:scale-95"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
            <Heart size={16} className="fill-white" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-black leading-tight">Most Loved</h4>
            <p className="text-[10px] text-pink-100 font-medium mt-0.5">Highlights</p>
          </div>
        </Link>

        {/* Most Viewed */}
        <Link
          href={`/gallery${eventParam}${eventParam ? "&" : "?"}sort=most_viewed`}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-3.5 text-white shadow-sm transition active:scale-95"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
            <Flame size={16} className="fill-white" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-black leading-tight">Most Viewed</h4>
            <p className="text-[10px] text-amber-100 font-medium mt-0.5">Moments</p>
          </div>
        </Link>

        {/* Most Downloaded */}
        <Link
          href={`/gallery${eventParam}${eventParam ? "&" : "?"}sort=most_downloaded`}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-3.5 text-white shadow-sm transition active:scale-95"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
            <Download size={16} />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-black leading-tight">Most Downloaded</h4>
            <p className="text-[10px] text-sky-100 font-medium mt-0.5">Top Picks</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
