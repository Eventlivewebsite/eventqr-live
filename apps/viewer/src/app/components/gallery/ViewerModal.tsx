"use client";

import { useEffect, useState } from "react";
import ZoomImage from "./ZoomImage";
import ViewerToolbar from "./ViewerToolbar";
import ViewerNavigation from "./ViewerNavigation";
import ViewerCounter from "./ViewerCounter";
import CommentBottomSheet from "./CommentBottomSheet";

type ViewerModalProps = {
  open: boolean;
  image?: string;
  liked: boolean;
  onLike: () => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  current: number;
  total: number;
};

export default function ViewerModal({
  open,
  image,
  liked,
  onLike,
  onClose,
  onNext,
  onPrev,
  current,
  total,
}: ViewerModalProps) {
  const [playing, setPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Keyboard Controls
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;

        case "ArrowRight":
          onNext();
          break;

        case "ArrowLeft":
          onPrev();
          break;

        case " ":
          e.preventDefault();
          setPlaying((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, onNext, onPrev]);

  // Slideshow
  useEffect(() => {
    if (!playing || !open) return;

    const interval = setInterval(() => {
      onNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [playing, open, onNext]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black">
   <ViewerToolbar
  onClose={onClose}
  image={image}
  liked={liked}
  onLike={onLike}
  playing={playing}
  onTogglePlay={() => setPlaying((prev) => !prev)}
  onComments={() => setShowComments(true)}
/>

      <ViewerNavigation
        onPrev={onPrev}
        onNext={onNext}
      />

      {image && (
        <ZoomImage
          image={image}
          liked={liked}
          onLike={onLike}
          onNext={onNext}
          onPrev={onPrev}
        />
      )}

     <CommentBottomSheet
  open={showComments}
  onClose={() => setShowComments(false)}
/>
      
    </div>
  );
}