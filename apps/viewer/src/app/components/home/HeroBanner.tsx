"use client";

import { useEffect, useState } from "react";
import { Sparkles, MapPin, Play } from "lucide-react";

export default function HeroBanner() {
  const [data, setData] = useState<any>({
    title: "Rohit & Priya",
    subtitle: "Forever Begins Today",
    location: "Jaipur Palace",
    heroTag: "LIVE EVENT",
    highlightType: "video",
    highlightVideoUrl: "",
    highlightPhotos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200"
    ]
  });
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && json?.event) {
          setData(json.event);
        }
      } catch {}
    }
    loadData();
  }, []);

  // Slideshow auto-transition if photos selected
  useEffect(() => {
    if (data.highlightType === "photos" && data.highlightPhotos?.length > 1) {
      const timer = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % data.highlightPhotos.length);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [data.highlightType, data.highlightPhotos]);

  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-b-[40px] shadow-2xl">
      {/* Background Media */}
      {data.highlightType === "video" && data.highlightVideoUrl ? (
        <video
          src={data.highlightVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 h-full w-full">
          {(data.highlightPhotos || []).map((img: string, i: number) => (
            <img
              key={i}
              src={img}
              alt="Slide"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === activeSlide ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
      )}

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
          <Sparkles size={12} /> {data.heroTag || "LIVE EVENT"}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">{data.title}</h1>
        <p className="text-sm font-medium text-amber-200">{data.subtitle}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-300 pt-1">
          <MapPin size={14} className="text-amber-400" />
          <span>{data.location}</span>
        </div>
      </div>
    </div>
  );
}