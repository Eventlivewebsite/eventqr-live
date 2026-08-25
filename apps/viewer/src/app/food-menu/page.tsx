"use client";

import { useRouter } from "next/navigation";

import MobileContainer from "../components/layout/MobileContainer";

import FoodHero from "../components/food/FoodHero";
import FoodSection from "../components/food/FoodSection";

export default function FoodMenuPage() {

  const router = useRouter();

  return (
    <MobileContainer>

      <main className="min-h-screen overflow-hidden bg-gradient-to-br from-[#FFFDFB] via-[#FFF8F2] to-[#FFF4ED]">

        {/* Premium Background */}

        <div className="pointer-events-none fixed inset-0">

          <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-amber-200/20 blur-[120px]" />

          <div className="absolute top-60 -right-20 h-72 w-72 rounded-full bg-orange-200/20 blur-[120px]" />

          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-200/20 blur-[120px]" />

        </div>

        <div className="relative z-10">

          <FoodHero
            onBack={() => router.back()}
          />

          <FoodSection />

        </div>

      </main>

    </MobileContainer>
  );
}