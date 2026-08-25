"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

type Props = {
  initialLikes?: number;
  initialLiked?: boolean;
  size?: number;
};

export default function LikeButton({
  initialLikes = 0,
  initialLiked = false,
  size = 22,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [animate, setAnimate] = useState(false);

  function handleLike() {
    setAnimate(true);

    setTimeout(() => {
      setAnimate(false);
    }, 350);

    if (liked) {
      setLiked(false);
      setLikes((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikes((prev) => prev + 1);
    }
  }

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-2 rounded-full bg-white/85 backdrop-blur-xl px-3 py-2 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <Heart
        size={size}
        className={`transition-all duration-300
          ${
            liked
              ? "fill-red-500 text-red-500"
              : "text-gray-500"
          }
          ${
            animate
              ? "scale-125"
              : "scale-100"
          }`}
      />

      <span className="text-sm font-semibold text-gray-700">
        {likes}
      </span>
    </button>
  );
}