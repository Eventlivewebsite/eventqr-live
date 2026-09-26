"use client";

import { useEffect, useState } from "react";
import PremiumCard from "../ui/PremiumCard";
import { Image, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AlbumsSection() {
  const [albums, setAlbums] = useState<any[]>([
    { title: "Wedding", count: "Highlights" },
    { title: "Haldi", count: "Memories" },
    { title: "Reception", count: "Celebration" },
  ]);

  useEffect(() => {
    async function loadAlbums() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;

        if (json?.success && Array.isArray(json?.event?.albums) && json.event.albums.length > 0) {
          const mapped = json.event.albums.map((alb: any) => ({
            title: alb.title || alb.name || "Album",
            count: alb.photoCount ? `${alb.photoCount} Photos` : "Special Moments",
          }));
          setAlbums(mapped);
        } else if (json?.success && Array.isArray(json?.event?.categoriesList) && json.event.categoriesList.length > 0) {
          const mapped = json.event.categoriesList.slice(0, 4).map((cat: string) => ({
            title: cat,
            count: "View Album",
          }));
          setAlbums(mapped);
        }
      } catch {}
    }
    loadAlbums();
  }, []);

  return (
    <section className="mt-8 px-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">📚 Albums</h2>
        <Link href="/gallery" className="text-sm font-semibold text-amber-600 hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {albums.map((album) => (
          <Link href={`/gallery/${encodeURIComponent(album.title.toLowerCase())}`} key={album.title}>
            <PremiumCard className="group cursor-pointer p-4 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                  <Image size={20} />
                </div>
                <ArrowRight size={16} className="text-gray-400 transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-3 font-bold text-gray-900 line-clamp-1">{album.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{album.count}</p>
            </PremiumCard>
          </Link>
        ))}
      </div>
    </section>
  );
}