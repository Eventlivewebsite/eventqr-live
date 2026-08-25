"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const filters = [
  "All",
  "Wedding",
  "Haldi",
  "Mehendi",
  "Reception",
    "Decoration",
];

type Props = {
  active: string;
  onChange: (value: string) => void;
  videoType?: string;
};

export default function VideoFilter({
  active,
  onChange,
  videoType = "default",
}: Props) {
  const router = useRouter();

  // Category Page
  if (videoType !== "default") {
    return (
      <div className="mb-6 flex gap-3 overflow-x-auto no-scrollbar">

        <button
          onClick={() => router.push("/videos")}
          className="flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
        >
          <ArrowLeft size={16} />
          Back Videos
        </button>

        <button className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
          {videoType
            .split("-")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
            )
            .join(" ")}
        </button>

      </div>
    );
  }

  // Main Videos Page
  return (
    <div className="mb-6 flex gap-3 overflow-x-auto no-scrollbar">

      {filters.map((filter) => (

        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            active === filter
              ? "bg-red-500 text-white shadow-lg"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {filter}
        </button>

      ))}

    </div>
  );
}