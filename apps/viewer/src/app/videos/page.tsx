"use client";

import { useState } from "react";

import MobileContainer from "../components/layout/MobileContainer";
import VideoHeader from "../components/video/VideoHeader";
import VideoDrawer from "../components/video/VideoDrawer";
import VideoSearch from "../components/video/VideoSearch";
import VideoFilter from "../components/video/VideoFilter";
import VideoGrid from "../components/video/VideoGrid";

export default function VideosPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All Videos");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MobileContainer>
      <main className="relative min-h-screen overflow-hidden bg-[#fffafc]">

        {/* Premium Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -top-52 -left-44 h-[520px] w-[520px] rounded-full bg-pink-400/30 blur-[180px]" />

          <div className="absolute top-16 -right-40 h-[420px] w-[420px] rounded-full bg-rose-300/25 blur-[170px]" />

          <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-200/25 blur-[190px]" />

          <div className="absolute top-1/2 left-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-[120px]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff55_0%,transparent_60%)]" />

        </div>

        <div className="relative z-10">

          <VideoHeader
            onMenuClick={() => setDrawerOpen(true)}
          />

          {/* Back Button */}
          {selectedType !== "All Videos" && (

            <div className="px-5 pt-5">

              <button
                onClick={() => {
                  setSelectedType("All Videos");
                  setCategory("All");
                  setSearch("");
                }}
                className="mb-4 flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold shadow-lg transition hover:shadow-xl"
              >
                ← Back Gallery
              </button>

              <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 text-lg font-bold text-white shadow-lg">
                {selectedType}
              </div>

            </div>

          )}

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
            />

          </section>

          <section className="px-5 py-6">

            <div className="mb-6 rounded-[30px] bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-6 text-white shadow-2xl ring-1 ring-white/20">

              <p className="text-sm uppercase tracking-[0.35em] text-white/80">
                Premium Wedding Films
              </p>

              <h2 className="mt-2 text-3xl font-bold leading-tight">
                Relive Every Beautiful
                <br />
                Moment 🎥
              </h2>

              <p className="mt-3 text-sm text-white/90">
                Watch cinematic memories from every event.
              </p>

            </div>

            <VideoGrid
              search={search}
              category={category}
              videoType={selectedType}
            />

          </section>

        </div>
<VideoDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  onSelect={(type) => {
    setSelectedType(type);
    setDrawerOpen(false);
    setSearch("");
    setCategory("All");
  }}
/>

      </main>
    </MobileContainer>
  );
}