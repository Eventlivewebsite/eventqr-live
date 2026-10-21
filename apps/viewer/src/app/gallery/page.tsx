"use client";
import React, { useState, useEffect } from "react";
import MobileContainer from "../components/layout/MobileContainer";
import GalleryHeader from "../components/gallery/GalleryHeader";
import GalleryGrid from "../components/gallery/GalleryGrid";
import GalleryDrawer from "../components/gallery/GalleryDrawer";

export default function GalleryPage() {

  useEffect(() => {
    // Zero-reload instant sync across tabs/devices
    if (typeof window !== "undefined") {
      const channel = new BroadcastChannel("event_media_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "MEDIA_UPLOADED") {
          // Instant silent state refresh without full page reload
          if (typeof fetchPhotos === "function") {
            fetchPhotos();
          }
        }
      };
      return () => channel.close();
    }
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MobileContainer>

      <style jsx global>{`
        @keyframes luxuryColorFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-event-heading {
          background: linear-gradient(-45deg, #d97706, #e11d48, #9333ea, #2563eb, #b45309);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: luxuryColorFlow 5s ease-in-out infinite;
        }
      `}</style>
    

      <GalleryHeader
        onMenuClick={() => setDrawerOpen(true)}
      />

      <main className="p-5">
        <GalleryGrid />
      </main>

      <GalleryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </MobileContainer>
  );
}
