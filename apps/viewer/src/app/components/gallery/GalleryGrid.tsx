"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import GalleryCard from "./GalleryCard";
import ViewerModal from "./ViewerModal";
import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";
import { galleryData } from "@/app/lib/gallery-data";


const initialPhotos = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    views: "2.5K",
    likes: 890,
    liked: false,
    comments: 1,
    height: "h-52",
    category: "Wedding",
    
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    views: "1.8K",
    likes: 620,
    liked: false,
    comments: 2,
    height: "h-80",
    category: "Haldi",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800",
    views: "3.1K",
    likes: 1200,
    liked: false,
    comments: 3,
    height: "h-64",
    category: "Mehendi",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
    views: "950",
    likes: 310,
    liked: false,
    comments: 4,
    height: "h-96",
    category: "Reception",
  },
  {
  id: 5,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 5,
  height: "h-72",
  category: "Wedding",
},

{
  id: 6,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 6,
  height: "h-64",
  category: "Haldi",
},

{
  id: 7,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 7,
  height: "h-96",
  category: "Mehendi",
},
{
  id: 8,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 8,
  height: "h-72",
  category: "Reception",
},

{
  id: 9,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 9,
  height: "h-64",
  category: "Wedding",
},

{
  id: 10,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 10,
  height: "h-96",
  category: "Haldi",
},
{
  id: 11,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 11,
  height: "h-72",
  category: "Mehendi",
},

{
  id: 12,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 13,
  height: "h-64",
  category: "Reception",
},

{
  id: 13,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 14,
  height: "h-96",
  category: "Wedding",
},
{
  id: 14,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 15,
  height: "h-72",
  category: "Haldi",
},

{
  id: 15,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 16,
  height: "h-64",
  category: "Mehendi",
},

{
  id: 16,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 17,
  height: "h-96",
  category: "Reception",
},
{
  id: 17,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 18,
  height: "h-72",
  category: "Wedding",
},

{
  id: 18,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 19,
  height: "h-64",
  category: "Haldi",
},

{
  id: 19,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 20,
  height: "h-96",
  category: "Mehendi",
},
{
  id: 20,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 21,
  height: "h-72",
  category: "Reception",
},

{
  id: 21,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 22,
  height: "h-64",
  category: "Wedding",
},

{
  id: 22,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 23,
  height: "h-96",
  category: "Haldi",
},
{
  id: 23,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 24,
  height: "h-72",
  category: "Mehendi",
},

{
  id: 24,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 25,
  height: "h-64",
  category: "Reception",
},

{
  id: 25,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 26,
  height: "h-96",
  category: "Wedding",
},
{
  id: 26,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 27,
  height: "h-72",
  category: "Haldi",
},

{
  id: 27,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 28,
  height: "h-64",
  category: "Mehendi",
},

{
  id: 28,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 29,
  height: "h-96",
  category: "Reception",
},
{
  id: 29,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 30,
  height: "h-72",
  category: "Wedding",
},

{
  id: 30,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 31,
  height: "h-64",
  category: "Haldi",
},

{
  id: 31,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 32,
  height: "h-96",
  category: "Mehendi",
},
{
  id: 32,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 33,
  height: "h-72",
  category: "Reception",
},

{
  id: 33,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 34,
  height: "h-64",
  category: "Wedding",
},

{
  id: 34,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 35,
  height: "h-96",
  category: "Haldi",
},
{
  id: 35,
  image:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  views: "1.2K",
  likes: 340,
  liked: false,
  comments: 36,
  height: "h-72",
  category: "Haldi",
},

{
  id: 36,
  image:
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
  views: "2.1K",
  likes: 510,
  liked: false,
  comments: 37,
  height: "h-64",
  category: "Reception",
},

{
  id: 37,
  image:
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
  views: "3.5K",
  likes: 980,
  liked: false,
  comments: 38,
  height: "h-96",
  category: "Wedding",
},

];
galleryData.default = initialPhotos;
type Props = {
  galleryType?: string;
};

export default function GalleryGrid({
  galleryType = "default",
}: Props) {
 const [galleryPhotos, setGalleryPhotos] =
  useState(
    galleryData[galleryType] ??
      galleryData.default
  );

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All");

  const [showFavorites, setShowFavorites] =
  
    useState(false);
    
const [selectionMode, setSelectionMode] = useState(false);
const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const audioRef =
    useRef<HTMLAudioElement>(null);

  const [musicOn, setMusicOn] =
    useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

   if (musicOn) {
  audioRef.current
    .play()
    .catch((err) => console.log(err));
} else {
  audioRef.current.pause();
}
  }, [musicOn]);
  const photoCounts = {
  All: galleryPhotos.length,
  Wedding: galleryPhotos.filter(
    (p) => p.category === "Wedding"
  ).length,
  Haldi: galleryPhotos.filter(
    (p) => p.category === "Haldi"
  ).length,
  Mehendi: galleryPhotos.filter(
    (p) => p.category === "Mehendi"
  ).length,
  Reception: galleryPhotos.filter(
    (p) => p.category === "Reception"
  ).length,
};
  const filteredPhotos = galleryPhotos.filter((photo) => {
  const searchText = search.trim().toLowerCase();

  const matchFavorite =
    !showFavorites || photo.liked;

  // Search hone par category ignore hogi
  if (searchText !== "") {
    return (
      (photo.category.toLowerCase().includes(searchText) ||
        photo.image.toLowerCase().includes(searchText)) &&
      matchFavorite
    );
  }

  // Search empty ho to selected category chalegi
  const matchCategory =
    category === "All" ||
    photo.category.toLowerCase() ===
      category.toLowerCase();

  return matchCategory && matchFavorite;
});

  return (
  <>
    <audio
      ref={audioRef}
      preload="auto"
      loop
    >
      <source
        src="/music/wedding.mp3"
        type="audio/mpeg"
      />
    </audio>

    <SearchBar
      value={search}
      onChange={setSearch}
    
    />

<FilterChips
  active={category}
  onChange={setCategory}
  counts={photoCounts}
  galleryType={galleryType}
/>

      <div className="mt-4 flex items-center justify-between">

        <button
          onClick={() =>
            setShowFavorites(!showFavorites)
          }
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            showFavorites
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          ❤️ {showFavorites ? "All Photos" : "Favorites"}
        </button>
        {selectionMode && selectedPhotos.length > 0 && (
  <div className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow">
    {selectedPhotos.length} Selected
  </div>
)}
<button
  onClick={() => {
    setSelectionMode(!selectionMode);
    setSelectedPhotos([]);
  }}
  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
    selectionMode
      ? "bg-blue-600 text-white"
      : "bg-gray-200 text-black"
  }`}
>
  {selectionMode ? "Done" : "Select"}
</button>
        {selectionMode && selectedPhotos.length > 0 && (
  <button
    onClick={() => setSelectedPhotos([])}
    className="rounded-full bg-gray-600 px-4 py-2 text-sm font-medium text-white"
  >
    Clear
  </button>
)}
{selectionMode && selectedPhotos.length > 0 && (
  <button
    onClick={() => {
      selectedPhotos.forEach((id, index) => {
        const photo = galleryPhotos.find((p) => p.id === id);
        if (!photo) return;

        setTimeout(() => {
          const link = document.createElement("a");
          link.href = photo.image;
          link.download = `photo-${id}.jpg`;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 300);
      });
    }}
    className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white"
  >
    ⬇ Download
  </button>
)}
      </div>

    


      <div className="mt-6 columns-2 gap-4">{filteredPhotos.map((photo, index) => (
<div
  key={photo.id}
  className="relative mb-4 break-inside-avoid"
>
    <GalleryCard
      image={photo.image}
      views={photo.views}
      likes={photo.likes}
      comments={photo.comments}
      liked={photo.liked}
      height={photo.height}
      onClick={() => {
  if (selectionMode) {
    setSelectedPhotos((prev) =>
      prev.includes(photo.id)
        ? prev.filter((id) => id !== photo.id)
        : [...prev, photo.id]
    );
    return;
  }

  if (filteredPhotos[index]) {
    setSelectedIndex(index);
  }
}}
      onLike={() => {
        setGalleryPhotos((prev) =>
          prev.map((item) =>
            item.id === photo.id
              ? {
                  ...item,
                  liked: !item.liked,
                  likes: item.liked
                    ? item.likes - 1
                    : item.likes + 1,
                }
              : item
          )
        );
      }}
    />
    {selectionMode && (
  <button
    onClick={() => {
      setSelectedPhotos((prev) =>
        prev.includes(photo.id)
          ? prev.filter((id) => id !== photo.id)
          : [...prev, photo.id]
      );
    }}
    className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${
      selectedPhotos.includes(photo.id)
        ? "bg-blue-600 border-blue-600 text-white"
        : "bg-white border-gray-300 text-gray-600"
    }`}
  >
    {selectedPhotos.includes(photo.id) ? "✓" : ""}
  </button>
)}
  </div>
  
))}
</div>

<ViewerModal
  open={
    selectedIndex !== null &&
    filteredPhotos.length > 0 &&
    !!filteredPhotos[selectedIndex]
  }
  image={
    selectedIndex !== null
      ? filteredPhotos[selectedIndex].image
      : undefined
  }
  liked={
    selectedIndex !== null
      ? filteredPhotos[selectedIndex].liked
      : false
  }
  onLike={() => {
    if (selectedIndex === null) return;

    const currentPhoto = filteredPhotos[selectedIndex];

    setGalleryPhotos((prev) =>
      prev.map((item) =>
        item.id === currentPhoto.id
          ? {
              ...item,
              liked: !item.liked,
              likes: item.liked
                ? item.likes - 1
                : item.likes + 1,
            }
          : item
      )
    );
  }}
  current={(selectedIndex ?? 0) + 1}
  total={filteredPhotos.length}
  onClose={() => setSelectedIndex(null)}
onNext={() =>
  setSelectedIndex((prev) => {
    if (prev === null) return 0;
    return (prev + 1) % filteredPhotos.length;
  })
}
onPrev={() =>
  setSelectedIndex((prev) => {
    if (prev === null) return 0;
    return (
      (prev - 1 + filteredPhotos.length) %
      filteredPhotos.length
    );
  })
}
/>

    </>
  );
}