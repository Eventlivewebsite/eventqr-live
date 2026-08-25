"use client";

import { useRef, useState } from "react";
import VideoToolbar from "./VideoToolbar";
import VideoControls from "./VideoControls";
import VideoComments from "./VideoComments";

type Props = {
  open: boolean;
  video?: string;
  likes: number;
  onLike: () => void;
  onClose: () => void;
};

export default function VideoPlayer({
  open,
  video,
  likes,
  onLike,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  if (!open) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setPlaying(!playing);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black">

      <VideoToolbar
        liked={liked}
        likes={likes}
        onLike={() => {
          setLiked(!liked);
          onLike();
        }}
        onClose={onClose}
      />

      <div className="flex h-full items-center justify-center">

        <video
          ref={videoRef}
          src={video}
          className="max-h-full max-w-full"
        />
              </div>

      <VideoControls
        playing={playing}
        onTogglePlay={togglePlay}
        onPrev={() => {}}
        onNext={() => {}}
      />

      <button
        onClick={() => setCommentsOpen(true)}
        className="absolute bottom-28 right-6 rounded-full border border-white/20 bg-white/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/30"
      >
        💬 Comments
      </button>

      <VideoComments
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
          </div>
  );
}