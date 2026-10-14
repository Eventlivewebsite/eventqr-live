"use client";

import { Suspense, useState } from "react";
import MobileContainer from "./components/layout/MobileContainer";
import Header from "./components/layout/Header";
import MenuDrawer from "./components/layout/drawer/MenuDrawer";
import HeroBanner from "./components/home/HeroBanner";
import GallerySection from "./components/home/GallerySection";
import TrendingSection from "./components/home/TrendingSection";
import CategoriesSection from "./components/home/CategoriesSection";
import AlbumsSection from "./components/home/AlbumsSection";
import PlaylistSection from "./components/home/PlaylistSection";
import TimelineSection from "./components/home/TimelineSection";
import BottomNavigation from "./components/navigation/BottomNavigation";
import { EventProvider } from "./context/EventContext";

function MainViewerContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MobileContainer>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <MenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      
      <HeroBanner />
      <GallerySection />
      <TrendingSection />
      <CategoriesSection />
      <AlbumsSection />
      <PlaylistSection />
      <TimelineSection />
      
      <div className="h-16" />
      <BottomNavigation />
    </MobileContainer>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white text-xs">Loading Live Event...</div>}>
      <EventProvider>
        <MainViewerContent />
      </EventProvider>
    </Suspense>
  );
}
