"use client";

import { useEffect, useState } from "react";
import { Music, Play, Pause } from "lucide-react";

export default function PlaylistSection() {
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [currentSong, setCurrentSong] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && json?.event) {
          setShowPlaylist(json.event.showPlaylist !== false);
          if (Array.isArray(json.event.playlist)) {
            setPlaylist(json.event.playlist);
            if (json.event.playlist.length > 0) setCurrentSong(json.event.playlist[0]);
          }
        }
      } catch {}
    }
    loadData();
  }, []);

  const togglePlay = (song: any) => {
    if (currentSong?.id === song.id && isPlaying) {
      audio?.pause();
      setIsPlaying(false);
    } else {
      audio?.pause();
      const newAudio = new Audio(song.url);
      newAudio.play().catch(() => {});
      setAudio(newAudio);
      setCurrentSong(song);
      setIsPlaying(true);
      newAudio.onended = () => setIsPlaying(false);
    }
  };

  if (!showPlaylist || playlist.length === 0) return null;

  return (
    <section className="mt-8 px-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Music className="text-amber-600" size={20} /> Event Playlist
        </h2>
      </div>

      <div className="space-y-2">
        {playlist.map((track) => (
          <div
            key={track.id}
            onClick={() => togglePlay(track)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 border border-amber-100 shadow-sm cursor-pointer hover:bg-amber-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                {currentSong?.id === track.id && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{track.title}</h4>
                <p className="text-xs text-gray-500">{track.artist}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-600">
              {currentSong?.id === track.id && isPlaying ? "Playing" : "Play"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}