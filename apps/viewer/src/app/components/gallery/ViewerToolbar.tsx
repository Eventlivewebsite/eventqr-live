"use client";

import {
  X,
  Heart,
  Download,
  Share2,
  Play,
  Pause,
  MessageCircle,
} from "lucide-react";

type Props = {
  onClose: () => void;
  image?: string;
  liked: boolean;
  onLike: () => void;
  playing: boolean;
onTogglePlay: () => void;
onComments: () => void;
};

export default function ViewerToolbar({
  onClose,
  image,
  liked,
  onLike,
  playing,
  onTogglePlay,
  onComments,
}: Props){
  const handleDownload = async () => {
    if (!image) return;
    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "photo.jpg";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    }
  };

  const handleShare = async () => {
    if (!image) return;
    if (navigator.share) {
      await navigator.share({
        title: "Gallery Photo",
        text: "Check this photo",
        url: image,
      });
    } else {
      await navigator.clipboard.writeText(image);
      alert("Image link copied");
    }
  };

  return (
    <div className="absolute left-5 right-5 top-5 flex items-center justify-between">

      <button
        onClick={onClose}
        className="rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
      >
        <X size={22} />
      </button>

      <div className="flex gap-3">

        <button
  onClick={onLike}
  className="rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
>
  <Heart
    size={20}
    className={liked ? "fill-red-500 text-red-500" : ""}
  />
</button>
<button
  onClick={onTogglePlay}
  className="rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
>
  {playing ? (
    <Pause size={20} />
  ) : (
    <Play size={20} />
  )}
</button>
<button
  onClick={onComments}
  className="rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
>
  <MessageCircle size={20} />
</button>
        <button
          onClick={handleDownload}
          className="rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
        >
          <Download size={20} />
        </button>

        <button
          onClick={handleShare}
          className="rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
        >
          <Share2 size={20} />
        </button>

      </div>

    </div>
  );
}