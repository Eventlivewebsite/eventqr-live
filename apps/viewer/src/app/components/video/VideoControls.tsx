"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
} from "lucide-react";

type Props = {
  playing: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function VideoControls({
  playing,
  onTogglePlay,
  onNext,
  onPrev,
}: Props) {
  return (
    <div className="absolute bottom-6 left-0 right-0 z-20 px-6">

      <div className="mb-5 h-1.5 w-full rounded-full bg-white/20">
        <div className="h-full w-1/3 rounded-full bg-red-500" />
      </div>

      <div className="flex items-center justify-between">

        <button className="rounded-full bg-black/40 p-3 backdrop-blur-xl">
          <Volume2 size={20} className="text-white" />
        </button>

        <div className="flex items-center gap-5">

          <button
            onClick={onPrev}
            className="rounded-full bg-black/40 p-3 backdrop-blur-xl"
          >
            <SkipBack size={22} className="text-white" />
          </button>

          <button
            onClick={onTogglePlay}
            className="rounded-full bg-red-500 p-5 shadow-2xl"
          >
            {playing ? (
              <Pause
                size={28}
                className="text-white"
              />
            ) : (
              <Play
                size={28}
                className="fill-white text-white"
              />
            )}
          </button>
          <button
            onClick={onNext}
            className="rounded-full bg-black/40 p-3 backdrop-blur-xl"
          >
            <SkipForward size={22} className="text-white" />
          </button>

        </div>

        <button className="rounded-full bg-black/40 p-3 backdrop-blur-xl">
          <Maximize size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}