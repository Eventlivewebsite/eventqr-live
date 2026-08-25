"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import MobileContainer from "../../components/layout/MobileContainer";
import GalleryHeader from "../../components/gallery/GalleryHeader";
import GalleryGrid from "../../components/gallery/GalleryGrid";
import GalleryDrawer from "../../components/gallery/GalleryDrawer";

export default function CategoryGalleryPage() {
  const params = useParams();
  const category = params.category as string;

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MobileContainer>

      <GalleryHeader
        onMenuClick={() => setDrawerOpen(true)}
      />

      <main className="p-5">
        <GalleryGrid galleryType={category} />
      </main>

      <GalleryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </MobileContainer>
  );
}