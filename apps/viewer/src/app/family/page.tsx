"use client";

import { useRouter } from "next/navigation";

import MobileContainer from "../components/layout/MobileContainer";

import FamilyHero from "../components/family/FamilyHero";
import FamilySection from "../components/family/FamilySection";

export default function FamilyPage() {
  const router = useRouter();

  return (
    <MobileContainer>
      <main className="min-h-screen bg-gradient-to-b from-[#fffaf8] via-white to-[#fff7ef]">

        <FamilyHero
          onBack={() => router.back()}
        />

        <div className="px-5 pb-28">

          <FamilySection />

        </div>

      </main>
    </MobileContainer>
  );
}