"use client";

import { Suspense } from "react";
import MobileContainer from "../../components/layout/MobileContainer";
import GalleryHeader from "../../components/gallery/GalleryHeader";
import GalleryGrid from "../../components/gallery/GalleryGrid";
import GalleryDrawer from "../../components/gallery/GalleryDrawer";
import { useState } from "react";

function CategoryGalleryContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MobileContainer>
      <GalleryHeader onMenuClick={() => setDrawerOpen(true)} />
      <main className="p-5">
        <GalleryGrid />
      </main>
      <GalleryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </MobileContainer>
  );
}

export default function CategoryGalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Loading...</div>}>
      <CategoryGalleryContent />
    </Suspense>
  );
}
