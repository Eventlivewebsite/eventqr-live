"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import MobileContainer from "../../components/layout/MobileContainer";
import VideoHeader from "../../components/video/VideoHeader";
import VideoSearch from "../../components/video/VideoSearch";
import VideoFilter from "../../components/video/VideoFilter";
import VideoGrid from "../../components/video/VideoGrid";

export default function CategoryVideosPage() {
  const params = useParams();

  const categorySlug = params.category as string;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  return (
    <MobileContainer>
      <main className="min-h-screen bg-gray-50">

       <VideoHeader
  onMenuClick={() => {}}
/>

        <section className="px-5 pt-5">

          <VideoSearch
            value={search}
            onChange={(value) => {
              setSearch(value);
              if (value.trim() !== "") {
                setCategory("All");
              }
            }}
          />

          <VideoFilter
            active={category}
            onChange={setCategory}
            videoType={categorySlug}
          />

        </section>

        <section className="px-5 py-6">

          <VideoGrid
            search={search}
            category={category}
            videoType={categorySlug}
          />

        </section>

      </main>
    </MobileContainer>
  );
}