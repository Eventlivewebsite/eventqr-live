"use client";

import { X, ChevronRight, Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
};

const collections = [
  {
    title: "Wedding Stage",
    subtitle: "Photos & Videos",
    icon: "💍",
  },
  {
    title: "Floral Decoration",
    subtitle: "Photos & Videos",
    icon: "🌸",
  },
  {
    title: "Lighting",
    subtitle: "Photos & Videos",
    icon: "💡",
  },
  {
    title: "Entrance",
    subtitle: "Photos & Videos",
    icon: "🚪",
  },
  {
    title: "Dining",
    subtitle: "Photos & Videos",
    icon: "🍽️",
  },
  {
    title: "Selfie Booth",
    subtitle: "Photos & Videos",
    icon: "📸",
  },
  {
    title: "Reception Hall",
    subtitle: "Photos & Videos",
    icon: "🏛️",
  },
];

export default function VideoDrawer({
  open,
  onClose,
  onSelect,
}: Props) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 z-40 bg-black/40 transition-all duration-300 ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 z-50 max-h-[92vh] w-[88%] max-w-[340px] overflow-y-auto rounded-bl-[36px] rounded-tl-[36px] bg-white shadow-2xl transition-all duration-500 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-white p-7">

          <div className="flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Sparkles
                  size={24}
                  className="text-pink-500"
                />

                <h2 className="text-3xl font-bold">
                  Videos
                </h2>

              </div>

              <p className="mt-2 text-gray-500">
                Premium Video Collections
              </p>

            </div>

            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg"
            >
              <X />
            </button>

          </div>

        </div>

        {/* List */}
        <div className="space-y-5 p-6">

          {collections.map((item) => (

            <button
              key={item.title}
              onClick={() => {
                onSelect(item.title);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-[28px] border border-pink-100 bg-white p-5 text-left shadow-lg transition-all duration-300 hover:border-pink-300 hover:shadow-xl"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-3xl text-white shadow-lg">
                  {item.icon}
                </div>

                <div>

                  <h3 className="text-xl font-bold">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {item.subtitle}
                  </p>

                </div>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50">

                <ChevronRight
                  size={20}
                  className="text-pink-500"
                />

              </div>

            </button>

          ))}

        </div>

      </div>
    </>
  );
}