"use client";

import { X, Sparkles, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

const decorations = [
  { title: "Wedding Stage", icon: "💍" },
  { title: "Floral Decoration", icon: "🌸" },
  { title: "Lighting", icon: "💡" },
  { title: "Entrance", icon: "🚪" },
  { title: "Dining", icon: "🍽️" },
  { title: "Selfie Booth", icon: "📸" },
  { title: "Reception Hall", icon: "🏛️" },
];

export default function GalleryDrawer({
  open,
  onClose,
}: Props) {

  const router = useRouter();

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      {/* Drawer */}
<div className="absolute top-0 right-0 z-50 max-h-[90vh] w-[88%] max-w-[340px] overflow-hidden rounded-l-[32px] border-l border-white/40 bg-white/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)]">

  {/* Header */}

        {/* Header */}
        <div className="relative overflow-hidden border-b border-pink-100 bg-gradient-to-br from-white via-pink-50 to-rose-100 p-6">

          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-20 w-20 rounded-full bg-rose-200/40 blur-2xl" />

          <div className="relative flex items-center justify-between">

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Sparkles size={22} className="text-pink-500" />
                Decoration
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Premium Decoration Albums
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md transition hover:scale-105 hover:shadow-lg"
            >
              <X size={20} />
            </button>

          </div>

        </div>

        {/* List */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">

          {decorations.map((item) => (

            <button
              key={item.title}
              onClick={() => {
                router.push(
                  "/gallery/" +
                    item.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                );

                onClose();
              }}
              className="group flex w-full items-center justify-between rounded-3xl border border-pink-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 hover:bg-pink-50 hover:shadow-xl hover:shadow-pink-100"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-2xl text-white shadow-lg">
                  {item.icon}
                </div>

                <div>

                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Photos & Videos
                  </p>

                </div>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 transition-all duration-300 group-hover:bg-pink-500">

                <ChevronRight
                  size={18}
                  className="text-pink-500 transition-all duration-300 group-hover:text-white"
                />

              </div>

            </button>

          ))}

        </div>

      </div>
    </>
  );
}