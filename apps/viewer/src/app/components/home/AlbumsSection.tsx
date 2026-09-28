"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, ArrowRight, Download, Loader2, Check } from "lucide-react";
import Link from "next/link";

interface AlbumItem {
  title: string;
  countText: string;
  photos: string[];
}

export default function AlbumsSection() {
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [downloadingAlbum, setDownloadingAlbum] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlbums() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;

        if (json?.success && json?.event) {
          const cm = json.event.customMap || {};
          let vault: any[] = [];
          try {
            if (cm.mediaVault) vault = JSON.parse(cm.mediaVault);
          } catch {}

          let categoryNames: string[] = [];
          try {
            if (cm.photoCategories) categoryNames = JSON.parse(cm.photoCategories);
          } catch {}

          if (categoryNames.length === 0) {
            categoryNames = ["Ceremony", "Celebrations", "Family", "Candid"];
          }

          const mapped: AlbumItem[] = categoryNames.slice(0, 6).map((cat) => {
            const catPhotos = vault.filter((v: any) => v.category === cat && v.type === "photo").map((v: any) => v.url);
            return {
              title: cat,
              countText: catPhotos.length > 0 ? `${catPhotos.length} Photos` : "Special Moments",
              photos: catPhotos,
            };
          });

          setAlbums(mapped);
        }
      } catch {}
    }
    loadAlbums();
  }, []);

  // 1-Click Instant Bulk Album Downloader
  const handleBulkAlbumDownload = async (e: React.MouseEvent, alb: AlbumItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (alb.photos.length === 0) {
      alert("No photos uploaded in this album yet!");
      return;
    }

    setDownloadingAlbum(alb.title);

    try {
      // Trigger download for each photo sequentially
      for (let i = 0; i < alb.photos.length; i++) {
        const a = document.createElement("a");
        a.href = alb.photos[i];
        a.download = `${alb.title}-photo-${i + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise((r) => setTimeout(r, 250)); // Small interval for browser queue
      }
    } catch (err: any) {
      alert("Album download failed: " + err.message);
    } finally {
      setTimeout(() => setDownloadingAlbum(null), 1000);
    }
  };

  return (
    <section className="mt-8 px-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-1.5">
            📚 Event Albums
          </h2>
          <p className="text-[11px] text-gray-500 font-medium">Browse or download complete sets</p>
        </div>
        <Link href="/gallery" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-0.5">
          View All <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {albums.map((alb, i) => {
          const isDownloading = downloadingAlbum === alb.title;

          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                  <ImageIcon size={18} />
                </div>

                {/* 1-Click Album Download Button */}
                <button
                  type="button"
                  onClick={(e) => handleBulkAlbumDownload(e, alb)}
                  disabled={Boolean(downloadingAlbum)}
                  title="Download all photos from this album"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Download size={11} />
                      <span>Album</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900 truncate">{alb.title}</h3>
                <span className="text-[11px] font-medium text-gray-500">{alb.countText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
