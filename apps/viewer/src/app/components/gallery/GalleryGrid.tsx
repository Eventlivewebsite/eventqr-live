"use client";

import { useEffect, useRef, useState } from "react";
import GalleryCard from "./GalleryCard";
import ViewerModal from "./ViewerModal";
import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";
import { Camera, CheckSquare, Heart, Download, FolderArchive, ArrowLeft, X } from "lucide-react";

type Props = {
  galleryType?: string;
};

const HEIGHTS = ["h-52", "h-64", "h-72", "h-80", "h-96"];

export default function GalleryGrid({
  galleryType = "default",
}: Props) {
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [musicOn, setMusicOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<string>("");
  const [activeAlbum, setActiveAlbum] = useState<string>("");
  const [downloadingAll, setDownloadingAll] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  async function handleDownloadAll(itemsToDownload: any[]) {
    if (downloadingAll || itemsToDownload.length === 0) return;
    setDownloadingAll(true);
    try {
      for (let i = 0; i < itemsToDownload.length; i++) {
        const item = itemsToDownload[i];
        const mediaUrl = item.url || item.photoUrl || item.videoUrl;
        if (mediaUrl) {
          const res = await fetch(mediaUrl);
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = `${activeAlbum || "event-media"}_${i + 1}.${blob.type.includes("video") ? "mp4" : "jpg"}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(blobUrl);
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    } catch (e) {
      console.error("Batch download error:", e);
    } finally {
      setDownloadingAll(false);
    }
  }


  useEffect(() => {
    async function loadGalleryData() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        const catParam = urlParams.get("category");
        if (catParam) {
          setCategory(catParam.charAt(0).toUpperCase() + catParam.slice(1));
        }
        const sortParam = urlParams.get("sort");
        if (sortParam) setActiveSort(sortParam);

        const albumParam = urlParams.get("album");
        if (albumParam) setActiveAlbum(albumParam);

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;

        if (json?.success && Array.isArray(json?.event?.photos) && json.event.photos.length > 0) {
          const mapped = json.event.photos.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            image: item.url || item.thumbnailUrl,
            views: item.viewsCount ? (item.viewsCount >= 1000 ? `${(item.viewsCount / 1000).toFixed(1)}K` : String(item.viewsCount)) : "1.2K",
            likes: item.likesCount || 0,
            liked: false,
            comments: idx % 4 + 1,
            height: HEIGHTS[idx % HEIGHTS.length],
            category: item.category || "General",
          }));
          setGalleryPhotos(mapped);
        }
      } catch (err) {
        console.error("GalleryGrid load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGalleryData();
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.play().catch((err) => console.log(err));
    } else {
      audioRef.current.pause();
    }
  }, [musicOn]);

  // Dynamic photo counts calculation based on whatever categories exist
  const photoCounts: Record<string, number> = {
    All: galleryPhotos.length,
  };
  galleryPhotos.forEach((p) => {
    if (!p.category) return;
    photoCounts[p.category] = (photoCounts[p.category] || 0) + 1;
  });

  let processedPhotos = [...galleryPhotos];

  // 1. Album isolation
  if (activeAlbum) {
    processedPhotos = processedPhotos.filter((p: any) => {
      const pAlbum = (p.album || p.category || "").toLowerCase();
      return pAlbum === activeAlbum.toLowerCase();
    });
  }

  // 2. Category filter
  if (category && category.toLowerCase() !== "all") {
    processedPhotos = processedPhotos.filter((p: any) => {
      const pCat = (p.category || p.album || "").toLowerCase();
      return pCat === category.toLowerCase();
    });
  }

  // 3. Search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    processedPhotos = processedPhotos.filter((p: any) => {
      return (p.title && p.title.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q));
    });
  }

  // 4. Favorites filter
  if (showFavorites) {
    processedPhotos = processedPhotos.filter((p: any) => p.isFavorite || p.liked);
  }

  // 5. Sorting Engine: Most Loved / Most Viewed / Most Downloaded / Highlights
  if (activeSort === "most_loved") {
    processedPhotos.sort((a: any, b: any) => (b.likesCount || b.likes || 0) - (a.likesCount || a.likes || 0));
  } else if (activeSort === "most_viewed") {
    processedPhotos.sort((a: any, b: any) => (b.viewsCount || b.views || 0) - (a.viewsCount || a.views || 0));
  } else if (activeSort === "most_downloaded") {
    processedPhotos.sort((a: any, b: any) => (b.downloadsCount || b.downloads || 0) - (a.downloadsCount || a.downloads || 0));
  } else if (activeSort === "highlights") {
    processedPhotos.sort((a: any, b: any) => {
      const scoreA = (a.likesCount || 0) * 3 + (a.commentsCount || 0) * 2 + (a.downloadsCount || 0) * 2;
      const scoreB = (b.likesCount || 0) * 3 + (b.commentsCount || 0) * 2 + (b.downloadsCount || 0) * 2;
      return scoreB - scoreA;
    });
  }

  const filteredPhotos = processedPhotos;

  return (
    <>
      <audio ref={audioRef} preload="auto" loop>
        <source src="/music/wedding.mp3" type="audio/mpeg" />
      </audio>

      <SearchBar value={search} onChange={setSearch} />

      {/* Active Album / Sorting Header Banner */}
      {(activeAlbum || activeSort) && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50/90 p-3.5 shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
              {activeAlbum ? "Album View" : "Filtered Feed"}
            </span>
            <h2 className="text-sm font-black text-stone-900">
              {activeAlbum ? activeAlbum : activeSort.replace("_", " ").toUpperCase()}
            </h2>
            <p className="text-[11px] font-medium text-stone-500">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? "memory" : "memories"} found
            </p>
          </div>

          <div className="flex items-center gap-2">
            {filteredPhotos.length > 0 && (
              <button
                onClick={() => handleDownloadAll(filteredPhotos)}
                disabled={downloadingAll}
                className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-stone-800 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <Download size={13} />
                <span>{downloadingAll ? "Downloading..." : "Download All"}</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveAlbum("");
                setActiveSort("");
                const sp = new URLSearchParams(window.location.search);
                sp.delete("album");
                sp.delete("sort");
                window.history.replaceState({}, "", `${window.location.pathname}?${sp.toString()}`);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-xs hover:bg-stone-100 cursor-pointer"
              title="Clear Filter"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
      <FilterChips
        active={category}
        onChange={setCategory}
        counts={photoCounts}
        galleryType={galleryType}
      />

      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              showFavorites
                ? "bg-rose-500 text-white shadow-xs"
                : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            <Heart size={14} className={showFavorites ? "fill-white" : "text-rose-500"} />
            <span>{showFavorites ? "All Photos" : "Favorites"}</span>
          </button>

          <button
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedPhotos([]);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              selectionMode
                ? "bg-stone-900 text-white shadow-xs"
                : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            <CheckSquare size={14} />
            <span>{selectionMode ? "Done" : "Select"}</span>
          </button>
        </div>

        {selectionMode && selectedPhotos.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">
              {selectedPhotos.length} picked
            </span>
            <button
              onClick={() => {
                selectedPhotos.forEach((id, index) => {
                  const photo = galleryPhotos.find((p) => p.id === id);
                  if (!photo) return;
                  setTimeout(() => {
                    const link = document.createElement("a");
                    link.href = photo.image;
                    link.download = `photo-${id}.jpg`;
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }, index * 300);
                });
              }}
              className="rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800"
            >
              Download
            </button>
          </div>
        )}
      </div>

      {!loading && galleryPhotos.length === 0 && (
        <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-stone-50/60 p-8 text-center">
          <div className="mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-8 ring-stone-100">
            <Camera size={28} className="text-stone-400 stroke-[1.7]" />
          </div>
          <h4 className="text-base font-bold text-stone-800">No Photos Yet</h4>
          <p className="mt-1 max-w-[240px] text-xs text-stone-500 leading-relaxed">
            Photos uploaded or approved for this event will appear right here in your live stream.
          </p>
        </div>
      )}

      <div className="mt-6 columns-2 gap-4">
        {filteredPhotos.map((photo, index) => (
          <div key={photo.id} className="relative mb-4 break-inside-avoid">
            <GalleryCard
              image={photo.image}
              views={photo.views}
              likes={photo.likes}
              comments={photo.comments}
              liked={photo.liked}
              height={photo.height}
              onClick={() => {
                if (selectionMode) {
                  setSelectedPhotos((prev) =>
                    prev.includes(photo.id)
                      ? prev.filter((id) => id !== photo.id)
                      : [...prev, photo.id]
                  );
                  return;
                }

                if (filteredPhotos[index]) {
                  setSelectedIndex(index);
                }
              }}
              onLike={() => {
                setGalleryPhotos((prev) =>
                  prev.map((item) =>
                    item.id === photo.id
                      ? {
                          ...item,
                          liked: !item.liked,
                          likes: item.liked ? item.likes - 1 : item.likes + 1,
                        }
                      : item
                  )
                );
              }}
            />
            {selectionMode && (
              <button
                onClick={() => {
                  setSelectedPhotos((prev) =>
                    prev.includes(photo.id)
                      ? prev.filter((id) => id !== photo.id)
                      : [...prev, photo.id]
                  );
                }}
                className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  selectedPhotos.includes(photo.id)
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-600"
                }`}
              >
                {selectedPhotos.includes(photo.id) ? "✓" : ""}
              </button>
            )}
          </div>
        ))}
      </div>

      <ViewerModal
        open={
          selectedIndex !== null &&
          filteredPhotos.length > 0 &&
          Boolean(filteredPhotos[selectedIndex])
        }
        image={
          selectedIndex !== null
            ? filteredPhotos[selectedIndex]?.image
            : undefined
        }
        liked={
          selectedIndex !== null
            ? filteredPhotos[selectedIndex]?.liked
            : false
        }
        onLike={() => {
          if (selectedIndex === null) return;
          const currentPhoto = filteredPhotos[selectedIndex];
          if (!currentPhoto) return;

          setGalleryPhotos((prev) =>
            prev.map((item) =>
              item.id === currentPhoto.id
                ? {
                    ...item,
                    liked: !item.liked,
                    likes: item.liked ? item.likes - 1 : item.likes + 1,
                  }
                : item
            )
          );
        }}
        current={(selectedIndex ?? 0) + 1}
        total={filteredPhotos.length}
        onClose={() => setSelectedIndex(null)}
        onNext={() =>
          setSelectedIndex((prev) => {
            if (prev === null) return 0;
            return (prev + 1) % filteredPhotos.length;
          })
        }
        onPrev={() =>
          setSelectedIndex((prev) => {
            if (prev === null) return 0;
            return (
              (prev - 1 + filteredPhotos.length) %
              filteredPhotos.length
            );
          })
        }
      />
    </>
  );
}