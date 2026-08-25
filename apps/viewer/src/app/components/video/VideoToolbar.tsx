"use client";

import {
  X,
  Heart,
  Download,
  Share2,
} from "lucide-react";

type Props = {
  liked: boolean;
  likes: number;
  onLike: () => void;
  onClose: () => void;
};

export default function VideoToolbar({
  liked,
  likes,
  onLike,
  onClose,
}: Props) {

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "A & S Wedding",
          text: "Watch our beautiful wedding memories ❤️",
          url: window.location.href,
        });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(
        window.location.href
      );

      alert("Link copied successfully.");
    }
  };

  const handleDownload = () => {
    alert("Download feature coming soon.");
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 pt-5">

      {/* Close */}
      <button
        onClick={onClose}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl"
      >
        <X
          size={22}
          className="text-white"
        />
      </button>

      <div className="flex items-center gap-3">
                {/* Like */}
        <button
          onClick={onLike}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-3 backdrop-blur-xl transition-all duration-300 hover:scale-105"
        >
          <Heart
            size={20}
            className={
              liked
                ? "fill-red-500 text-red-500"
                : "text-white"
            }
          />

          <span className="text-sm font-semibold text-white">
            {likes}
          </span>
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:scale-105"
        >
          <Download
            size={20}
            className="text-white"
          />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:scale-105"
        >
          <Share2
            size={20}
            className="text-white"
          />
        </button>

      </div>
          </div>
  );
}