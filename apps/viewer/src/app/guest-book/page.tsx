"use client";

import { useRouter } from "next/navigation";

import MobileContainer from "../components/layout/MobileContainer";

import GuestBookHero from "../components/guestbook/GuestBookHero";
import GuestBookSection from "../components/guestbook/GuestBookSection";

export default function GuestBookPage() {
  const router = useRouter();

  return (
    <MobileContainer>
      <main className="min-h-screen overflow-hidden bg-gradient-to-b from-[#fffaf8] via-white to-[#fff7ef]">

        <GuestBookHero
          onBack={() => router.back()}
        />

        <div className="px-5 pb-28">

          <GuestBookSection />

        </div>

      </main>
    </MobileContainer>
  );
}