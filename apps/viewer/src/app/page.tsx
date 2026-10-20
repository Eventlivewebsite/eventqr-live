"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlSlug = sp.get("slug") || sp.get("event") || "";
      
      if (urlSlug) {
        const storedSlug = sessionStorage.getItem("active_event_slug");
        if (storedSlug !== urlSlug) {
          sessionStorage.setItem("active_event_slug", urlSlug);
        }
      }
    }
  }, []);

  return (
    <MobileContainer>
      <style jsx global>{`
        @keyframes softCeremonyGlow {
          0% {
            border-color: rgba(245, 158, 11, 0.4);
            box-shadow: 0 0 14px rgba(245, 158, 11, 0.35), inset 0 0 10px rgba(245, 158, 11, 0.1);
          }
          33% {
            border-color: rgba(225, 29, 72, 0.6);
            box-shadow: 0 0 18px rgba(225, 29, 72, 0.45), inset 0 0 12px rgba(225, 29, 72, 0.15);
          }
          66% {
            border-color: rgba(147, 51, 234, 0.55);
            box-shadow: 0 0 18px rgba(147, 51, 234, 0.45), inset 0 0 12px rgba(147, 51, 234, 0.15);
          }
          100% {
            border-color: rgba(245, 158, 11, 0.4);
            box-shadow: 0 0 14px rgba(245, 158, 11, 0.35), inset 0 0 10px rgba(245, 158, 11, 0.1);
          }
        }
        .luxury-ceremony-box {
          animation: softCeremonyGlow 4s ease-in-out infinite alternate !important;
        }

        @keyframes luxurySoftFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .luxury-color-shift {
          background: linear-gradient(-45deg, #d97706, #e11d48, #9333ea, #2563eb, #b45309);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: luxurySoftFlow 6s ease-in-out infinite;
        }
      `}</style>

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