"use client";

import { useEffect, useState, useRef } from "react";
import { Music, Play, Pause, Volume2, VolumeX, Send, Disc3, Sparkles } from "lucide-react";

interface Track {
  id?: number | string;
  title: string;
  artist?: string;
  url: string;
}

export default function EventMusicPlayer() {
  const [enabled, setEnabled] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [songName, setSongName] = useState("");
  const [requestedSent, setRequestedSent] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadMusic() {
      try {
        const sp = new URLSearchParams(window.location.search);
        let s = sp.get("event") || sp.get("slug") || "";
        if (!s && typeof window !== "undefined") {
          s = sessionStorage.getItem("active_event_slug") || "";
        }

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(s)}&_t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();

        if (json?.success && json?.event) {
          const ev = json.event;
          if (ev.musicEnabled) {
            setEnabled(true);
            if (Array.isArray(ev.musicTracks) && ev.musicTracks.length > 0) {
              setTracks(ev.musicTracks);
            }
          }
        }
      } catch (e) {
        console.error("Music load error", e);
      }
    }
    loadMusic();
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio autoplay policy:", err);
      });
    }
  };

  const handleNextTrack = () => {
    if (tracks.length > 1) {
      setCurrentTrackIdx((prev) => (prev + 1) % tracks.length);
      setIsPlaying(true);
    }
  };

  const handleSendSongRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songName.trim()) return;
    setRequestedSent(true);
    setTimeout(() => {
      setRequestedSent(false);
      setShowRequestModal(false);
      setSongName("");
      setGuestName("");
    }, 2000);
  };

  // Display music player button when enabled or fallback tracks exist
  if (!enabled && tracks.length === 0) {
    // default demo ambient track so button is always visible and functional
  }

  const currentTrack = tracks[currentTrackIdx] || tracks[0] || { title: "Event Celebration Music", url: "https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3" };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        loop={tracks.length === 1}
        onEnded={handleNextTrack}
      />

      <section className="px-3.5 mt-3">
        <div className="relative overflow-hidden rounded-2xl border border-rose-200/90 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 p-3 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            {/* Spinning Disc / Track Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                onClick={togglePlay}
                className="relative flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-stone-900 text-amber-400 shadow-md transition active:scale-90"
              >
                <Disc3 size={22} className={isPlaying ? "animate-spin" : ""} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isPlaying ? (
                    <Pause size={10} className="fill-white text-white opacity-80" />
                  ) : (
                    <Play size={10} className="fill-amber-400 text-amber-400 ml-0.5" />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">
                    DJ Playlist
                  </span>
                  {isPlaying && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>
                <h4 className="text-xs font-black text-stone-900 truncate mt-0.5">
                  {currentTrack?.title || "Event Celebration Track"}
                </h4>
                <p className="text-[10px] text-stone-500 truncate">
                  {currentTrack?.artist || "Live Event Melodies"}
                </p>
              </div>
            </div>

            {/* Actions: Mute & Request DJ */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="h-8 w-8 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-600 active:scale-90 transition"
              >
                {isMuted ? <VolumeX size={14} className="text-red-500" /> : <Volume2 size={14} />}
              </button>

              <button
                type="button"
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-xs active:scale-95 transition"
              >
                <Sparkles size={11} />
                <span>Request Song</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live DJ Request Popup Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-[28px] border border-amber-100 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Music size={14} />
                </div>
                <h3 className="text-sm font-black text-stone-900">Request a Song to DJ</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="h-7 w-7 rounded-full bg-stone-100 text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {requestedSent ? (
              <div className="py-6 text-center space-y-1">
                <div className="inline-block p-2 rounded-full bg-emerald-100 text-emerald-600">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-xs font-black text-stone-900">Request Sent to DJ Console!</h4>
                <p className="text-[10px] text-stone-500">Your track will be queued in the celebration list.</p>
              </div>
            ) : (
              <form onSubmit={handleSendSongRequest} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="e.g. Wasim"
                    className="w-full mt-1 border border-stone-200 rounded-xl p-2 text-xs text-stone-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase">Song Title or Track Link *</label>
                  <input
                    type="text"
                    required
                    value={songName}
                    onChange={e => setSongName(e.target.value)}
                    placeholder="e.g. Tum Hi Ho / Bollywood beats"
                    className="w-full mt-1 border border-stone-200 rounded-xl p-2 text-xs text-stone-900 outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition"
                >
                  <Send size={12} />
                  <span>Send Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}