"use client";

import { useState, useEffect, useRef } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";

export default function FloatingMusicPlayer() {
  const [musicUrl, setMusicUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (s) {
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`, { cache: "no-store" })
          .then((r) => r.json())
          .then((d) => {
            const track = d?.event?.musicUrl || d?.event?.backgroundMusic || "";
            if (track) {
              setMusicUrl(track);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  if (!musicUrl) return null;

  return (
    <>
      <audio ref={audioRef} src={musicUrl} loop preload="auto" />
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 rounded-full px-3.5 py-2 shadow-xl backdrop-blur-md transition-all active:scale-95 border ${
            isPlaying
              ? "bg-amber-500/90 text-stone-950 border-amber-300 shadow-amber-500/30 animate-pulse"
              : "bg-stone-900/80 text-amber-400 border-stone-700 shadow-black/40 hover:bg-stone-900"
          }`}
        >
          {isPlaying ? (
            <>
              <Volume2 size={16} className="animate-bounce" />
              <span className="text-[11px] font-bold tracking-wider uppercase">Playing</span>
            </>
          ) : (
            <>
              <VolumeX size={16} />
              <span className="text-[11px] font-bold tracking-wider uppercase">Play Music</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
