"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Film } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [activePlayUrl, setActivePlayUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        let activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        if (!activeSlug && typeof window !== "undefined") {
          activeSlug = sessionStorage.getItem("active_event_slug") || "";
        }

        if (activeSlug) {
          sessionStorage.setItem("active_event_slug", activeSlug);
          const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
          const json = res ? await res.json().catch(() => null) : null;
          
          if (json?.success && Array.isArray(json?.event?.videosList)) {
            setVideoList(json.event.videosList);
          } else {
            setVideoList([]);
          }
        } else {
          setVideoList([]);
        }
      } catch {
        setVideoList([]);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    return videoList.filter((v: any) => {
      const matchSearch =
        !search ||
        (v.title && v.title.toLowerCase().includes(search.toLowerCase())) ||
        (v.category && v.category.toLowerCase().includes(search.toLowerCase()));

      const matchCategory =
        !category ||
        category.toLowerCase() === "all" ||
        (v.category && v.category.toLowerCase() === category.toLowerCase());

      const matchType =
        !videoType ||
        videoType.toLowerCase() === "all videos" ||
        (v.album && v.album.toLowerCase() === videoType.toLowerCase()) ||
        (v.category && v.category.toLowerCase() === videoType.toLowerCase());

      return matchSearch && matchCategory && matchType;
    });
  }, [videoList, search, category, videoType]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-medium text-stone-400">
        Loading cinematic videos...
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50/60 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-stone-200 text-stone-400">
          <Film size={26} />
        </div>
        <h3 className="mt-4 text-sm font-bold text-stone-800">No Videos Yet</h3>
        <p className="mt-1 text-xs text-stone-500 max-w-[240px] mx-auto leading-relaxed">
          Videos uploaded and approved for this event will appear right here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5">
        {filteredVideos.map((video: any, idx: number) => {
          const videoSrc = video.videoUrl || video.url || "";
          const thumbnail = video.thumbnailUrl || video.thumb || video.previewUrl || "";
          const videoTitle = video.title || `Video #${idx + 1}`;
          const categoryTag = video.category || video.album || "Moments";

          return (
            <div
              key={video.id || idx}
              onClick={() => videoSrc && setActivePlayUrl(videoSrc)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs transition hover:shadow-md"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={videoTitle}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-900 text-amber-300">
                    <Film size={28} />
                  </div>
                )}

                {/* Tag Badge */}
                <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                  {categoryTag}
                </span>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/35">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-lg backdrop-blur-xs transition group-hover:scale-110">
                    <Play size={16} className="fill-stone-900 ml-0.5" />
                  </div>
                </div>

                {video.duration && (
                  <span className="absolute right-2 bottom-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    {video.duration}
                  </span>
                )}
              </div>

              {/* Title Card */}
              <div className="p-2.5">
                <h4 className="truncate text-xs font-bold text-stone-800">
                  {videoTitle}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Lightbox Player */}
      {activePlayUrl && (
        <div
          onClick={() => setActivePlayUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-black shadow-2xl"
          >
            <button
              onClick={() => setActivePlayUrl(null)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              ?
            </button>
            <video
              src={activePlayUrl}
              controls
              autoPlay
              className="max-h-[80vh] w-full rounded-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
