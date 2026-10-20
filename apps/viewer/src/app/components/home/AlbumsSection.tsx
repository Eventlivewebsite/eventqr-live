"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, ArrowRight, Download, Loader2, FolderArchive, Sparkles } from "lucide-react";
import Link from "next/link";

interface AlbumItem {
  title: string;
  countText: string;
  photos: string[];
}

export default function AlbumsSection() {
  const [slug, setSlug] = useState("");
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [downloadingAlbum, setDownloadingAlbum] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlbums() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        setSlug(activeSlug);

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;

        if (json?.success && json?.event) {
          const ev = json.event;
          const photoList: any[] = Array.isArray(ev.photos) ? ev.photos : [];
          
          let categories: string[] = Array.isArray(ev.photoCategories) && ev.photoCategories.length > 0 
            ? ev.photoCategories 
            : (Array.isArray(ev.categoriesList) && ev.categoriesList.length > 0 ? ev.categoriesList : []);

          if (categories.length === 0 && photoList.length > 0) {
            categories = Array.from(new Set(photoList.map((p: any) => p.category).filter(Boolean)));
          }

          // Exact 4 albums home view par limit
          const mapped: AlbumItem[] = categories.slice(0, 4).map((cat) => {
            const catPhotos = photoList
              .filter((p: any) => (p.category || "").toLowerCase() === cat.toLowerCase())
              .map((p: any) => p.url);

            return {
              title: cat,
              countText: catPhotos.length > 0 ? `${catPhotos.length} Photos` : "0 Photos",
              photos: catPhotos,
            };
          });

          setAlbums(mapped);
        }
      } catch (e) {
        console.error("Albums load error", e);
      }
    }
    loadAlbums();
  }, []);

  const handleBulkAlbumDownload = async (e: React.MouseEvent, alb: AlbumItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (alb.photos.length === 0) {
      alert("No photos uploaded in this album yet!");
      return;
    }

    setDownloadingAlbum(alb.title);

    try {
      for (let i = 0; i < alb.photos.length; i++) {
        const a = document.createElement("a");
        a.href = alb.photos[i];
        a.download = `${alb.title}-photo-${i + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise((r) => setTimeout(r, 250));
      }
    } catch (err: any) {
      alert("Album download failed: " + err.message);
    } finally {
      setTimeout(() => setDownloadingAlbum(null), 1000);
    }
  };

  if (albums.length === 0) return null;

  return (
    <section className="px-3.5 mt-3">
      {/* Left-to-Right Full Highlighted Header Bar */}
      <div className="mb-3 flex items-center justify-between rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/5 p-2.5 px-3.5 shadow-xs backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-xs">
            <FolderArchive className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 leading-tight">
                Event Albums
              </h2>
              <Sparkles size={11} className="text-amber-500 fill-amber-400" />
            </div>
            <p className="text-[10px] font-semibold text-stone-500 leading-tight">
              Browse or download complete sets
            </p>
          </div>
        </div>

        {/* Polished View All Button */}
        <Link 
          href={`/gallery?event=${encodeURIComponent(slug)}`} 
          className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-amber-900 shadow-xs border border-amber-200 hover:bg-amber-50 active:scale-95 transition-all duration-200"
        >
          View All <ArrowRight size={12} className="text-amber-600" />
        </Link>
      </div>

      {/* Clean 2x2 Grid with exact 4 cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {albums.map((alb, i) => {
          const isDownloading = downloadingAlbum === alb.title;

          return (
            <Link
              key={i}
              href={`/gallery?category=${encodeURIComponent(alb.title.toLowerCase())}&event=${encodeURIComponent(slug)}`}
              className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-3 flex flex-col justify-between space-y-2.5 hover:border-amber-300 hover:shadow-sm transition-all duration-200 active:scale-95 block"
            >
              <div className="flex items-start justify-between">
                <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                  <ImageIcon size={16} />
                </div>

                <button
                  type="button"
                  onClick={(e) => handleBulkAlbumDownload(e, alb)}
                  disabled={Boolean(downloadingAlbum)}
                  title="Download all photos from this album"
                  className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-black text-white text-[9px] font-bold flex items-center gap-1 shadow-xs transition active:scale-90"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={10} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Download size={10} />
                      <span>Album</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <h3 className="font-bold text-xs text-stone-900 truncate">{alb.title}</h3>
                <span className="text-[10px] font-medium text-stone-500">{alb.countText}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}