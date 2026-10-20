"use client";

import { useState } from "react";
import MobileContainer from "./components/layout/MobileContainer";
import Header from "./components/layout/Header";
import MenuDrawer from "./components/layout/drawer/MenuDrawer";
import HeroBanner from "./components/home/HeroBanner";
import EventMusicPlayer from "./components/home/EventMusicPlayer";
import GallerySection from "./components/home/GallerySection";
import TrendingSection from "./components/home/TrendingSection";
import CategoriesSection from "./components/home/CategoriesSection";
import AlbumsSection from "./components/home/AlbumsSection";
import TimelineSection from "./components/home/TimelineSection";
import PlaylistSection from "./components/home/PlaylistSection";
import BottomNavigation from "./components/navigation/BottomNavigation";

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MobileContainer>
      <div className="flex min-h-screen flex-col bg-white">
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <MenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        <main className="space-y-4 pb-28">
          <HeroBanner />
          
          {/* Continuous Event Music Player & DJ Requests */}
          <EventMusicPlayer />

          <GallerySection />
          <TrendingSection />
          <CategoriesSection />
          
          {/* 1. Event Albums (Exact 4 Cards) */}
          <AlbumsSection />

          {/* 2. Schedule & Timings */}
          <div id="timeline-section">
            <TimelineSection />
          </div>

          <PlaylistSection />
        </main>

        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}