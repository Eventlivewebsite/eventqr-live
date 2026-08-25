"use client";

import { Play, Heart, MapPin } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative h-80 overflow-hidden rounded-[28px]">

      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"
        alt="Wedding"
        className="h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* LIVE Badge */}
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        LIVE EVENT
      </div>

      {/* Content */}
      <div className="absolute bottom-6 left-5 right-5">

      

       <h1 className="mt-1 text-2xl font-bold text-white">
          A & S Wedding
        </h1>

        <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
          <MapPin size={16} />
          Jaipur Palace
        </div>

        <div className="mt-5 flex gap-3">

          <button className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-black transition hover:scale-105">
            <Play size={18} fill="black" />
            Watch Highlights
          </button>

          <button className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-white backdrop-blur-md transition hover:bg-white/20">
            <Heart size={18} />
            Our Story
          </button>

        </div>
<div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs uppercase tracking-wider text-white/70">
        Ceremony
      </p>
      <h3 className="mt-1 text-lg font-semibold text-white">
        Wedding Reception
      </h3>
    </div>

    <div className="text-right">
      <p className="text-xs text-white/70">Starts In</p>
      <h2 className="text-xl font-bold text-white">
        02 : 14 : 36
      </h2>
    </div>
  </div>
</div>
      </div>
    </section>
  );
}