"use client";

import { ArrowLeft, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  onMenuClick?: () => void;
};

export default function VideoHeader({
  onMenuClick,
}: Props) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-pink-100 bg-white/90 backdrop-blur-xl">

      <div className="flex items-center justify-between px-5 py-4">

        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="rounded-xl p-2 transition hover:bg-pink-50"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Title */}
        <div className="text-center">

          <h1 className="text-3xl font-bold tracking-wide">
            🎥 A &amp; S FILMS
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Relive Every Moment
          </p>

        </div>

        {/* Menu */}
        <button
          onClick={() => onMenuClick?.()}
          className="rounded-xl p-2 transition hover:bg-pink-50"
        >
          <Menu size={24} />
        </button>

      </div>

    </header>
  );
}