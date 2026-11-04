"use client";

import { useState, useEffect, useRef } from "react";
import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";
import GalleryCard from "./GalleryCard";
import ViewerModal from "./ViewerModal";
import { Heart, CheckSquare, Download, X, Camera } from "lucide-react";

export type GalleryPhotoItem = {
  id: string;
  image: string;
  views?: string | number;
  likes?: number;
  comments?: number;
  liked?: boolean;
  height?: string;
  section?: string;
  category?: string;
  album?: string;
  isFavorite?: boolean;
  viewsCount?: number;
  downloadsCount?: number;
  likesCount?: number;
  commentsCount?: number;
};

type Props = {
  photos?: GalleryPhotoItem[];
  categories?: string[];
  galleryType?: string;
};

export default function GalleryGrid({ photos: initialPhotos = [], categories: propCategories = [], galleryType = "photos" }: Props) {
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>(initialPhotos);
  const [category, setCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeAlbum, setActiveAlbum] = useState<string>("");
  const [activeSort, setActiveSort] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initialPhotos && initialPhotos.length > 0) {
      setGalleryPhotos(initialPhotos);
    }
  }, [initialPhotos]);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(Array.from(new Set(["All", ...propCategories.filter(Boolean)])));
    }
  }, [propCategories]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlAlbum = sp.get("album") || "";
      const urlCat = sp.get("category") || "";
      const urlSort = sp.get("sort") || "";
      if (urlAlbum) {
        setActiveAlbum(urlAlbum);
        setCategory("All");
      } else if (urlCat) {
        setCategory(urlCat);
        setActiveAlbum("");
      }
      if (urlSort) {
        setActiveSort(urlSort);
      }
    }
  }, []);

  const fetchMedia = async () => {
    if (typeof window === "undefined") return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const slug = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (!slug) return;
      setLoading(true);
      const res = await fetch(`/api/event-data?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      const rawVault = data?.event?.mediaVault || [];
      if (Array.isArray(rawVault) && rawVault.length > 0) {
        const mappedVaultPhotos: GalleryPhotoItem[] = rawVault
          .filter((item: any) => !item.type || item.type === "photo" || item.type === "image")
          .map((item: any, idx: number) => {
            const rawCat = String(item.category || "").trim();
            const rawSec = String(item.section || "").trim();
            const rawAlb = String(item.album || "").trim();
            const isDecoration = rawSec.toLowerCase() === "decoration" || rawCat.toLowerCase().startsWith("decoration") || Boolean(rawAlb);
            const cleanDecorName = (rawAlb || rawCat)
              .replace(/^decoration\s*[:\-]?\s*/i, "")
              .replace(/^\[(category|decoration)\]\s*->?\s*/i, "")
              .trim();
            const cleanCategoryName = rawCat
              .replace(/^decoration\s*[:\-]?\s*/i, "")
              .replace(/^\[(category|decoration)\]\s*->?\s*/i, "")
              .trim();

            return {
              id: item.id || `vault-photo-${idx}`,
              image: item.url || item.secure_url || item.image || "",
              views: item.views || "1.2K",
              likes: Number(item.likes || 0),
              comments: Number(item.comments || 0),
              liked: false,
              height: item.height || (idx % 3 === 0 ? "h-64" : idx % 2 === 0 ? "h-72" : "h-56"),
              section: isDecoration ? "Decoration" : "Category",
              category: isDecoration ? "Decoration" : (cleanCategoryName || "General"),
              album: isDecoration ? cleanDecorName : "",
            };
          });
        setGalleryPhotos(mappedVaultPhotos);
      }
    } catch (err) {
      console.warn("fetchMedia error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialPhotos || initialPhotos.length === 0) {
      fetchMedia();
    }
  }, []);

  // Instant Live Viewer Push Synchronization (Top Level Hook)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("event_media_sync");
        bc.onmessage = (ev) => {
          if (ev.data && (ev.data.type === "EVENT_MEDIA_SYNC" || ev.data.eventId)) {
            fetchMedia();
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel sync error:", e);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "eventqr_media_push_trigger" && e.newValue) {
        fetchMedia();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Category Counts Calculation
  const photoCounts: Record<string, number> = { All: galleryPhotos.length };
  categories.forEach((cat) => {
    if (cat === "All") return;
    const target = cat.trim().toLowerCase();
    photoCounts[cat] = galleryPhotos.filter((p) => {
      const c = (p.category || "").trim().toLowerCase();
      return c === target || c.includes(target) || target.includes(c);
    }).length;
  });

  // 1. Initial Photos Reference
  let processedPhotos = [...galleryPhotos];

  // 2. Category filter (When user clicks on top Filter Chips)
  if (category && category.trim().toLowerCase() !== "all") {
    const target = category.trim().toLowerCase();
    processedPhotos = processedPhotos.filter((p) => {
      const cat = (p.category || "").trim().toLowerCase();
      return cat === target || cat.includes(target) || target.includes(cat);
    });
  }

  // 3. Album filter (When user clicks on Decoration Drawer items like 'efasref')
  if (activeAlbum && activeAlbum.trim() !== "") {
    const targetAlb = activeAlbum.trim().toLowerCase();
    processedPhotos = processedPhotos.filter((p) => {
      const alb = (p.album || "").trim().toLowerCase();
      return alb === targetAlb || alb.includes(targetAlb) || targetAlb.includes(alb);
    });
  }

  // 3.5 Search query filter
  if (search.trim()) {
    const q = search.toLowerCase();
    processedPhotos = processedPhotos.filter((p) =>
      (p.category || "").toLowerCase().includes(q) ||
      (p.album || "").toLowerCase().includes(q)
    );
  }

  // 4. Favorites filter
  if (showFavorites) {
    processedPhotos = processedPhotos.filter((p) => p.isFavorite || p.liked);
  }

  // 5. Sorting Engine: Most Loved / Most Viewed / Most Downloaded / Highlights
  if (activeSort === "most_loved") {
    processedPhotos.sort((a, b) => ((b.likesCount ?? b.likes) || 0) - ((a.likesCount ?? a.likes) || 0));
  } else if (activeSort === "most_viewed") {
    processedPhotos.sort((a, b) => ((b.viewsCount ?? Number(b.views)) || 0) - ((a.viewsCount ?? Number(a.views)) || 0));
  } else if (activeSort === "most_downloaded") {
    processedPhotos.sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));
  } else if (activeSort === "highlights") {
    processedPhotos.sort((a, b) => {
      const scoreA = (a.likesCount || 0) * 3 + (a.commentsCount || 0) * 2 + (a.downloadsCount || 0) * 2;
      const scoreB = (b.likesCount || 0) * 3 + (b.commentsCount || 0) * 2 + (b.downloadsCount || 0) * 2;
      return scoreB - scoreA;
    });
  }

  const filteredPhotos = processedPhotos;

  const handleDownloadAll = (photosList: GalleryPhotoItem[]) => {
    setDownloadingAll(true);
    photosList.forEach((p, idx) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = p.image;
        a.download = `photo-${p.id}.jpg`;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (idx === photosList.length - 1) setDownloadingAll(false);
      }, idx * 300);
    });
  };

  return (
    <>
      <audio ref={audioRef} preload="auto" loop>
        <source src="/music/wedding.mp3" type="audio/mpeg" />
      </audio>

      <SearchBar value={search} onChange={setSearch} />

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
                          likes: item.liked ? (item.likes || 1) - 1 : (item.likes || 0) + 1,
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
                {selectedPhotos.includes(photo.id) ? "?" : ""}
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
                    likes: item.liked ? (item.likes || 1) - 1 : (item.likes || 0) + 1,
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
