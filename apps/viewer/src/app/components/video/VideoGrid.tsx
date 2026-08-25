"use client";

import { useMemo, useState } from "react";
import { videos } from "@/app/lib/video-data";

type Props = {
  search: string;
  category: string;
  videoType?: string;
};

export default function VideoGrid({
  search,
  category,
  videoType = "All Videos",
}: Props) {

  const [videoList, setVideoList] = useState(videos);

  const [showFavorites, setShowFavorites] =
    useState(false);

  const [selectionMode, setSelectionMode] =
    useState(false);

  const [selectedVideos, setSelectedVideos] =
    useState<number[]>([]);

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const filteredVideos = useMemo(() => {

    return videoList.filter((video) => {

      const matchSearch =
        search.trim() === "" ||
        video.title
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchType =
        videoType === "All Videos"
          ? true
          : video.type === videoType;

      const matchCategory =
        category === "All"
          ? true
          : video.category === category;

      const matchFavorite =
        !showFavorites || video.favorite;

      return (
        matchSearch &&
        matchType &&
        matchCategory &&
        matchFavorite
      );

    });

  }, [
    videoList,
    search,
    category,
    showFavorites,
    videoType,
  ]);

  return (
    <>

      {/* Top Buttons */}

      <div className="mb-8 flex items-center justify-between">

        <button
          onClick={() =>
            setShowFavorites(!showFavorites)
          }
          className={`rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition ${
            showFavorites
              ? "bg-rose-500 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          ❤️ {showFavorites ? "All Videos" : "Favorites"}
        </button>

        <button
          onClick={() => {

            setSelectionMode(!selectionMode);
            setSelectedVideos([]);

          }}
          className={`rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition ${
            selectionMode
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          {selectionMode ? "Done" : "Select"}
        </button>

      </div>
      {/* Premium Video List */}

<div className="space-y-8">

  {filteredVideos.map((video, index) => (

    <div
      key={video.id}
      className="overflow-hidden rounded-[34px] border border-white/70 bg-white p-4 shadow-[0_12px_40px_rgba(255,120,160,0.18)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(255,120,160,0.28)]"
    >

      <div
        onClick={() => {

          if (selectionMode) {

            setSelectedVideos((prev) =>
              prev.includes(video.id)
                ? prev.filter((id) => id !== video.id)
                : [...prev, video.id]
            );

            return;
          }

          setSelectedIndex(index);

        }}
        className="relative cursor-pointer overflow-hidden rounded-[26px]"
      >

        {/* Thumbnail */}

        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-72 w-full object-cover transition duration-700 hover:scale-105"
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* HD */}

        <div className="absolute left-4 top-4 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
          🎥 HD
        </div>

        {/* Duration */}

        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
          {video.duration}
        </div>

        {/* Play */}

        <div className="absolute inset-0 flex items-center justify-center">

          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/30 backdrop-blur-xl shadow-2xl">

            <span className="ml-2 text-5xl text-white">
              ▶
            </span>

          </div>

        </div>

        {/* Bottom Glass */}

        <div className="absolute bottom-5 left-5 right-5">

          <div className="flex items-center justify-between rounded-2xl bg-black/55 px-5 py-3 text-white backdrop-blur-xl">

            <span>
              👁 {(video.views / 1000).toFixed(1)}K
            </span>

            <span>
              ❤️ {video.likes}
            </span>

          </div>

        </div>

      </div>
            {/* Card Details */}

     

      {/* Selection Checkbox */}

      {selectionMode && (

        <button
          onClick={() =>
            setSelectedVideos((prev) =>
              prev.includes(video.id)
                ? prev.filter(
                    (id) => id !== video.id
                  )
                : [...prev, video.id]
            )
          }
          className={`absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg ${
            selectedVideos.includes(video.id)
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-white bg-white text-gray-700"
          }`}
        >
          {selectedVideos.includes(video.id)
            ? "✓"
            : ""}
        </button>

      )}

    </div>

  ))}

</div>
{/* Premium Video Viewer */}

{selectedIndex !== null && (

  <div className="fixed inset-0 z-50 bg-black">

    {/* Close */}

    <button
      onClick={() => setSelectedIndex(null)}
      className="absolute right-5 top-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-xl"
    >
      ✕
    </button>

    {/* Previous */}

    <button
      onClick={() =>
        setSelectedIndex((prev) =>
          prev === null
            ? 0
            : (prev - 1 + filteredVideos.length) %
              filteredVideos.length
        )
      }
      className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/90 p-4 text-2xl shadow-xl"
    >
      ◀
    </button>

    {/* Next */}

    <button
      onClick={() =>
        setSelectedIndex((prev) =>
          prev === null
            ? 0
            : (prev + 1) %
              filteredVideos.length
        )
      }
      className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/90 p-4 text-2xl shadow-xl"
    >
      ▶
    </button>

    {/* Video */}

    <div className="flex h-screen w-full items-center justify-center">

      <video
        key={filteredVideos[selectedIndex].id}
        src={filteredVideos[selectedIndex].video}
        controls
        autoPlay
        className="max-h-[82vh] w-full max-w-md rounded-[30px] bg-black shadow-[0_25px_80px_rgba(0,0,0,.55)]"
      />

    </div>

    {/* Bottom Info */}

    <div className="absolute bottom-28 left-0 right-0 px-6 text-white">

      <h2 className="text-2xl font-bold">
        {filteredVideos[selectedIndex].title}
      </h2>

      <p className="mt-2 text-white/70">
        {filteredVideos[selectedIndex].category}
      </p>

      <div className="mt-4 flex items-center gap-6 text-sm">

        <span>
          👁 {filteredVideos[selectedIndex].views.toLocaleString()}
        </span>

        <span>
          ❤️ {filteredVideos[selectedIndex].likes}
        </span>

        <span>
          💬 {filteredVideos[selectedIndex].comments}
        </span>

      </div>

    </div>

  </div>

)}
{/* Premium Bottom Toolbar */}

{selectedIndex !== null && (

  <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-5 rounded-full border border-white/20 bg-white/95 px-7 py-4 shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop-blur-2xl">

    {/* Like */}

    <button
      onClick={() => {

        const current =
          filteredVideos[selectedIndex];

        setVideoList((prev) =>
          prev.map((item) =>
            item.id === current.id
              ? {
                  ...item,
                  favorite: !item.favorite,
                  likes: item.favorite
                    ? item.likes - 1
                    : item.likes + 1,
                }
              : item
          )
        );

      }}
      className="text-3xl transition duration-300 hover:scale-125"
    >
      {filteredVideos[selectedIndex].favorite
        ? "❤️"
        : "🤍"}
    </button>

    {/* Share */}

    <button
      onClick={() => {

        if (navigator.share) {

          navigator.share({
            title:
              filteredVideos[selectedIndex].title,
            url: window.location.href,
          });

        } else {

          navigator.clipboard.writeText(
            window.location.href
          );

          alert("Link Copied");

        }

      }}
      className="text-3xl transition duration-300 hover:scale-125"
    >
      📤
    </button>

    {/* Download */}

    <button
      onClick={() => {

        const a =
          document.createElement("a");

        a.href =
          filteredVideos[selectedIndex].video;

        a.download =
          filteredVideos[selectedIndex].title;

        a.target = "_blank";

        a.click();

      }}
      className="text-3xl transition duration-300 hover:scale-125"
    >
      ⬇
    </button>

    {/* Comments */}

    <button
      onClick={() =>
        alert(
          `${filteredVideos[selectedIndex].comments} Comments`
        )
      }
      className="text-3xl transition duration-300 hover:scale-125"
    >
      💬
    </button>

    {/* Fullscreen */}

    <button
      onClick={() => {

        const video =
          document.querySelector("video");

        if (
          video &&
          video.requestFullscreen
        ) {
          video.requestFullscreen();
        }

      }}
      className="text-3xl transition duration-300 hover:scale-125"
    >
      ⛶
    </button>

  </div>

)}
{/* Premium Empty State */}

{filteredVideos.length === 0 && (

<div className="mt-16 rounded-[36px] border border-pink-200/60 bg-white/90 p-12 text-center shadow-[0_20px_60px_rgba(255,120,170,.18)] backdrop-blur-xl">

<div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-6xl shadow-2xl">
🎬
</div>

<h2 className="mt-8 text-4xl font-bold text-gray-900">
No Videos Found
</h2>

<p className="mx-auto mt-4 max-w-sm text-gray-500">
Sorry, we couldn't find any videos matching your search.
Try another keyword or clear your search.
</p>

<div className="mt-10 flex justify-center gap-4">

<button
onClick={() => {
window.location.reload();
}}
className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-3 font-semibold text-white shadow-xl transition duration-300 hover:scale-105"
>
✨ Clear Search
</button>

<button
onClick={() => {
setShowFavorites(false);
}}
className="rounded-full border border-pink-300 bg-white px-8 py-3 font-semibold text-pink-600 shadow-lg transition duration-300 hover:bg-pink-50"
>
❤️ Show All
</button>

</div>

</div>

)}
{/* Premium Selection Bar */}

{selectionMode && selectedVideos.length > 0 && (

  <div className="fixed bottom-24 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-5 rounded-full border border-white/30 bg-white/95 px-8 py-4 shadow-[0_20px_60px_rgba(255,120,170,.25)] backdrop-blur-2xl">

    {/* Selected Count */}

    <div className="flex items-center gap-2">

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        ✓
      </div>

      <span className="font-bold text-gray-800">
        {selectedVideos.length} Selected
      </span>

    </div>

    {/* Clear */}

    <button
      onClick={() => setSelectedVideos([])}
      className="rounded-full border border-pink-200 bg-white px-5 py-2 font-semibold text-pink-600 transition hover:bg-pink-50"
    >
      Clear
    </button>

    {/* Download */}

    <button
      onClick={() => {

        selectedVideos.forEach((id, index) => {

          const item = videoList.find(
            (v) => v.id === id
          );

          if (!item) return;

          setTimeout(() => {

            const a =
              document.createElement("a");

            a.href = item.video;

            a.download = item.title;

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

          }, index * 300);

        });

      }}
      className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2 font-bold text-white shadow-xl transition hover:scale-105"
    >
      ⬇ Download
    </button>

  </div>

)}

    </>
  );
}