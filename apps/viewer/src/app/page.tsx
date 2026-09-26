"use client";

import { useState } from "react";
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

export default function HomePage() {
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