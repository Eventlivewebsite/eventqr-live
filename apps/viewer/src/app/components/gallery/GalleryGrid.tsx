"use client";

import { useEffect, useRef, useState } from "react";
import GalleryCard from "./GalleryCard";
import ViewerModal from "./ViewerModal";
import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";

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

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function loadGalleryData() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        const catParam = urlParams.get("category");
        if (catParam) {
          setCategory(catParam.charAt(0).toUpperCase() + catParam.slice(1));
        }

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

  const filteredPhotos = galleryPhotos.filter((photo) => {
    const searchText = search.trim().toLowerCase();
    const matchFavorite = !showFavorites || photo.liked;

    if (searchText !== "") {
      return (
        ((photo.category && photo.category.toLowerCase().includes(searchText)) ||
          photo.image.toLowerCase().includes(searchText)) &&
        matchFavorite
      );
    }

    const matchCategory =
      category.toLowerCase() === "all" ||
      (photo.category && photo.category.toLowerCase() === category.toLowerCase());

    return matchCategory && matchFavorite;
  });

  return (
    <>
      <audio ref={audioRef} preload="auto" loop>
        <source src="/music/wedding.mp3" type="audio/mpeg" />
      </audio>

      <SearchBar value={search} onChange={setSearch} />

      <FilterChips
        active={category}
        onChange={setCategory}
        counts={photoCounts}
        galleryType={galleryType}
      />

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            showFavorites ? "bg-red-500 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {showFavorites ? "All Photos" : "Favorites"}
        </button>

        {selectionMode && selectedPhotos.length > 0 && (
          <div className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow">
            {selectedPhotos.length} Selected
          </div>
        )}

        <button
          onClick={() => {
            setSelectionMode(!selectionMode);
            setSelectedPhotos([]);
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            selectionMode ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {selectionMode ? "Done" : "Select"}
        </button>

        {selectionMode && selectedPhotos.length > 0 && (
          <button
            onClick={() => setSelectedPhotos([])}
            className="rounded-full bg-gray-600 px-4 py-2 text-sm font-medium text-white"
          >
            Clear
          </button>
        )}

        {selectionMode && selectedPhotos.length > 0 && (
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
            className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white"
          >
            Download
          </button>
        )}
      </div>

      {!loading && galleryPhotos.length === 0 && (
        <div className="py-20 text-center text-sm text-gray-500">
          No photos have been uploaded or approved for this event yet.
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