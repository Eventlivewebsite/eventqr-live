"use client";

import { useEffect, useMemo, useState } from "react";
import { Play } from "lucide-react";

type Props = {
  search: string;
  category: string;
  videoType?: string;
};

export default function VideoGrid({
  search,
  category,
  videoType = "All Videos",
}: Props) {
  const [videoList, setVideoList] = useState<any[]>([]);

  useEffect(() => {
    async function loadVideos() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && Array.isArray(json?.event?.videosList) && json.event.videosList.length > 0) {
          setVideoList(json.event.videosList);
        } else {
          // Default fallbacks if none uploaded yet
          setVideoList([
            { id: 1, title: "Stage & Decoration Setup", category: "Decoration", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", duration: "01:45" },
            { id: 2, title: "Entry Highlights", category: "Highlights", url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800", duration: "02:10" },
          ]);
        }
      } catch {}
    }
    loadVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    return videoList.filter((video) => {
      const matchSearch =
        search.trim() === "" ||
        video.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        category === "All" || !category || video.category?.toLowerCase() === category.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [videoList, search, category]);

  return (
    <div className="grid grid-cols-2 gap-4 p-5">
      {filteredVideos.map((video) => (
        <div
          key={video.id}
          onClick={() => {
            if (video.videoUrl) window.open(video.videoUrl, "_blank");
          }}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="relative h-40 w-full overflow-hidden bg-gray-100">
            <img
              src={video.thumbnailUrl || video.url || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600"}
              alt={video.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md">
                <Play size={18} className="ml-0.5 fill-black text-black" />
              </div>
            </div>
            {video.category && (
              <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                {video.category}
              </span>
            )}
          </div>
          <div className="p-3">
            <h4 className="font-semibold text-gray-900 line-clamp-1 text-sm">{video.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{video.duration || "Video clip"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}