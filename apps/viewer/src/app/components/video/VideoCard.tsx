"use client";

import { Play, Eye, Heart } from "lucide-react";
import PremiumCard from "../ui/PremiumCard";

type Props = {
  thumbnail: string;
  duration: string;
  views: string;
  likes: number;
  onClick: () => void;
};

export default function VideoCard({
  thumbnail,
  duration,
  views,
  likes,
  onClick,
}: Props) {
  return (
    <PremiumCard
      className="group cursor-pointer overflow-hidden rounded-[28px] p-0 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
      onClick={onClick}
    >
      <div className="relative">

        {/* Thumbnail */}
        <img
          src={thumbnail}
          alt="Video Thumbnail"
          className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Premium Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Duration */}
        <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
          {duration}
        </div>

        {/* Glass Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-white/30">

            <Play
              size={34}
              className="ml-1 fill-white text-white"
            />

          </div>

        </div>

        {/* Bottom Glass Bar */}
        <div className="absolute bottom-4 left-4 right-4">

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white backdrop-blur-xl">

            <div className="flex items-center gap-2">

              <Eye size={16} />

              <span className="text-sm font-medium">
                {views}
              </span>

            </div>

            <div className="flex items-center gap-2">

              <Heart
                size={16}
                className="fill-red-500 text-red-500"
              />

              <span className="text-sm font-medium">
                {likes}
              </span>

            </div>

          </div>

        </div>

      </div>
    </PremiumCard>
  );
}