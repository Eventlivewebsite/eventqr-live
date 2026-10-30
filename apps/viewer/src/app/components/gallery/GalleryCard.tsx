"use client";

import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";

type GalleryCardProps = {
  image: string;
  views: string;
  likes: number;
  comments: number;
  liked: boolean;
  height: string;
  onClick: () => void;
  onLike: () => void;
};

export default function GalleryCard({
  image,
  views,
  likes,
  comments,
  liked,
  height,
  onClick,
  onLike,
}: GalleryCardProps) {
  return (
    <div
      onClick={onClick}
      className="group mb-3 overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-sm transition duration-300 hover:shadow-md cursor-pointer"
    >
      {/* Photo Frame */}
      <div className="relative overflow-hidden bg-stone-100">
        <img
          src={image}
          alt="Post"
          className={`${height} w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]`}
          loading="lazy"
        />

        {/* Top-Right Views Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
          <span>{views}</span>
        </div>
      </div>

      {/* Instagram Action Row */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white">
        <div className="flex items-center gap-3">
          {/* Like Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className="flex items-center gap-1.5 transition active:scale-75"
          >
            <Heart
              size={18}
              className={
                liked
                  ? "fill-rose-500 text-rose-500 transition"
                  : "text-stone-700 hover:text-stone-900 transition"
              }
            />
            <span
              className={`text-xs font-bold ${
                liked ? "text-rose-500" : "text-stone-800"
              }`}
            >
              {likes}
            </span>
          </button>

          {/* Comment Icon */}
          <div className="flex items-center gap-1 text-stone-600">
            <MessageCircle size={17} />
            <span className="text-xs font-medium text-stone-700">
              {comments}
            </span>
          </div>

          {/* Share Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({ title: "Event Photo", url: image }).catch(() => {});
              }
            }}
            className="text-stone-500 hover:text-stone-800 transition"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Bookmark Icon */}
        <Bookmark size={16} className="text-stone-400 hover:text-stone-700" />
      </div>
    </div>
  );
}
