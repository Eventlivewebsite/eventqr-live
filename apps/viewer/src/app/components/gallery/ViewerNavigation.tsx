"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

export default function ViewerNavigation({
  onPrev,
  onNext,
}: Props) {
  return (
    <>
      <button
        onClick={onPrev}
        className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white backdrop-blur transition hover:bg-white/20"
      >
        <ChevronLeft size={26} />
      </button>

      <button
        onClick={onNext}
        className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white backdrop-blur transition hover:bg-white/20"
      >
        <ChevronRight size={26} />
      </button>
    </>
  );
}