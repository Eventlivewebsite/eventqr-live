"use client";

import PremiumCard from "../ui/PremiumCard";
import {
  Heart,
  Eye,
  MessageCircle,
} from "lucide-react";

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
    <PremiumCard
      className="group cursor-pointer overflow-hidden p-0"
      onClick={onClick}
    >
      <div className="relative">

        <img
          src={image}
          alt="Gallery"
          className={`${height} w-full object-cover transition-transform duration-500 group-hover:scale-105`}
        />

        {/* Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Comment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Baad me comment bottom sheet open karenge
          }}
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-2 text-white backdrop-blur-md transition hover:bg-black/60"
        >
          <MessageCircle size={16} />
          <span className="text-xs font-semibold">
            {comments}
          </span>
        </button>

        {/* Bottom Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">

          {/* Views */}
          <span className="flex items-center gap-1 text-sm font-medium">
            <Eye size={15} />
            {views}
          </span>

          {/* Likes */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className="flex items-center gap-1 text-sm font-medium transition hover:scale-110"
          >
            <Heart
              size={15}
              className={
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-white"
              }
            />
            {likes}
          </button>

        </div>

      </div>
    </PremiumCard>
  );
}