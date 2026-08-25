"use client";

import { useRef, useState } from "react";
import { Heart } from "lucide-react";

type Props = {
  image: string;
  liked: boolean;
  onLike: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function ZoomImage({
  image,
  liked,
  onLike,
  onNext,
  onPrev,
}: Props) {
  const [scale, setScale] = useState(1);
  const [showHeart, setShowHeart] = useState(false);

  const touchStartX = useRef(0);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [dragging, setDragging] = useState(false);

  const [start, setStart] = useState({
    x: 0,
    y: 0,
  });

  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    e.preventDefault();

    setScale((prev) => {
      const next = prev + (e.deltaY < 0 ? 0.1 : -0.1);
      return Math.min(3, Math.max(1, next));
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;

    setDragging(true);

    setStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;

    setPosition({
      x: e.clientX - start.x,
      y: e.clientY - start.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const reset = () => {
    setScale(1);
    setPosition({
      x: 0,
      y: 0,
    });
  };

  const handleDoubleLike = () => {
    if (!liked) {
      onLike();
    }

    setShowHeart(true);

    setTimeout(() => {
      setShowHeart(false);
    }, 600);

    reset();
  };

  return (
    <div
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const diff =
          touchStartX.current - e.changedTouches[0].clientX;

        if (diff > 60) onNext();

        if (diff < -60) onPrev();
      }}
    >
      <img
        src={image}
        alt="Preview"
        draggable={false}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleLike}
        className={`max-h-[88vh] max-w-[94vw] rounded-3xl object-contain shadow-2xl select-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: dragging ? "none" : "transform .2s",
        }}
      />

      {showHeart && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Heart
            size={120}
            className="fill-red-500 text-red-500 animate-pulse drop-shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}