"use client";

import { useState } from "react";

import GallerySection from "./components/home/GallerySection";
import Header from "@/app/components/layout/Header";
import HeroBanner from "@/app/components/home/HeroBanner";
import MobileContainer from "@/app/components/layout/MobileContainer";
import BottomNavigation from "@/app/components/navigation/BottomNavigation";
import TrendingSection from "@/app/components/home/TrendingSection";
import AlbumsSection from "./components/home/AlbumsSection";
import CategoriesSection from "./components/home/CategoriesSection";
import TimelineSection from "./components/home/TimelineSection";

import MenuDrawer from "./components/layout/drawer/MenuDrawer";

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MobileContainer>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fffdfb] via-[#fff8f2] to-[#fff4f6]">

        {/* Soft Luxury Background */}
        <div className="pointer-events-none absolute inset-0">

          <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#F8DFA8]/20 blur-[120px]" />

          <div className="absolute top-32 -right-20 h-64 w-64 rounded-full bg-[#FFDCCF]/20 blur-[120px]" />

          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#FFF3D6]/25 blur-[130px]" />

        </div>

        <div className="relative z-10">

          <Header
            onMenuClick={() => setDrawerOpen(true)}
          />

          <HeroBanner />

          <div className="space-y-8 pb-28">

            <GallerySection />

            <TrendingSection />

            <AlbumsSection />

            <CategoriesSection />

            <TimelineSection />

          </div>

        </div>

      </main>

      <BottomNavigation />

      <MenuDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </MobileContainer>
  );
}