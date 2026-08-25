"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import MobileContainer from "../components/layout/MobileContainer";
import InvitationHero from "../components/invitation/InvitationHero";
import InvitationDetails from "../components/invitation/InvitationDetails";

export default function InvitationPage() {
  const router = useRouter();

  return (
    <MobileContainer>
      <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">

        {/* Premium Header */}

        <header className="sticky top-0 z-50 border-b border-white/40 bg-white/80 backdrop-blur-2xl">

          <div className="flex items-center justify-between px-5 py-4">

            {/* Back */}

            <button
              onClick={() => router.back()}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>

            {/* Title */}

            <div className="text-center">

              <h1 className="text-lg font-bold text-gray-900">
                💌 Invitation
              </h1>

              <p className="text-xs text-gray-500">
                Wedding Invitation
              </p>

            </div>

            {/* Spacer */}

            <div className="h-11 w-11" />

          </div>

        </header>

        {/* Content */}

        <div className="space-y-6 px-5 py-6">

          <InvitationHero />

          <InvitationDetails />

        </div>

      </main>
    </MobileContainer>
  );
}