"use client";

import { ArrowLeft, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  onMenuClick?: () => void;
};

export default function GalleryHeader({
  onMenuClick,
}: Props) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-4">

        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="rounded-xl p-2 transition hover:bg-gray-100"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide">
            A & S WEDDING
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Browse all memories
          </p>
        </div>

        {/* Menu */}
        <button
          onClick={() => onMenuClick?.()}
          className="rounded-xl p-2 transition hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>

      </div>
    </header>
  );
}