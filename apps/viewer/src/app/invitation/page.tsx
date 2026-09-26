"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import MobileContainer from "../components/layout/MobileContainer";
import BottomNavigation from "../components/navigation/BottomNavigation";

export default function InvitationPage() {
  const router = useRouter();
  const [data, setData] = useState({
    badge: "WEDDING INVITATION",
    initials: "A & S",
    tagline: "Together Forever",
    message: "Together with our families we request the honour of your presence to celebrate our wedding ceremony and blessings.",
    dateText: "15 February 2027",
    timeText: "07:00 PM Onwards",
    venueText: "Jaipur Palace, Rajasthan"
  });

  useEffect(() => {
    async function loadData() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && json?.event) {
          const ev = json.event;
          setData({
            badge: ev.inviteBadge || "WEDDING INVITATION",
            initials: ev.inviteCoupleInitials || ev.title || "A & S",
            tagline: ev.inviteTagline || ev.subtitle || "Together Forever",
            message: ev.inviteMessage || "Together with our families we request the honour of your presence to celebrate our wedding ceremony and blessings.",
            dateText: ev.inviteDateText || "15 February 2027",
            timeText: ev.inviteTimeText || "07:00 PM Onwards",
            venueText: ev.inviteVenueText || ev.location || "Jaipur Palace, Rajasthan"
          });
        }
      } catch {}
    }
    loadData();
  }, []);

  return (
    <MobileContainer>
      <main className="min-h-screen pb-28 text-gray-900 bg-gradient-to-b from-[#fdfbf7] to-[#fff6ee]">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-amber-100/60 bg-white/90 px-4 py-3.5 backdrop-blur-md">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-900 shadow-sm active:scale-95 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-gray-900 flex items-center justify-center gap-1.5">
              <span>💌</span> Invitation
            </h1>
            <p className="text-[10px] text-gray-500">Official Event Invitation</p>
          </div>
          <div className="h-10 w-10" />
        </div>

        <div className="p-4 space-y-5">
          {/* Main Invitation Card */}
          <div className="relative overflow-hidden rounded-[36px] border border-white/90 bg-gradient-to-b from-[#fff6ef] via-[#fffbf7] to-[#fff3e4] p-8 text-center shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">
              {data.badge}
            </p>

            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
              {data.initials}
            </h2>

            <p className="mt-2 text-base font-bold text-gray-700">
              {data.tagline}
            </p>

            <div className="my-5 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md text-purple-400">
                <Heart size={24} fill="currentColor" />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-gray-600 font-medium max-w-xs mx-auto">
              {data.message}
            </p>
          </div>

          {/* Details Card */}
          <div className="rounded-[32px] border border-white/80 bg-white/90 p-5 shadow-sm space-y-3.5">
            <h3 className="text-center text-lg font-extrabold text-gray-900 mb-2">
              Event Details
            </h3>

            <div className="flex items-center gap-3.5 rounded-2xl bg-amber-50/50 p-3.5 border border-amber-100/60">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Date</span>
                <p className="text-sm font-bold text-gray-900">{data.dateText}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl bg-amber-50/50 p-3.5 border border-amber-100/60">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Time</span>
                <p className="text-sm font-bold text-gray-900">{data.timeText}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl bg-amber-50/50 p-3.5 border border-amber-100/60">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <MapPin size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Venue</span>
                <p className="text-sm font-bold text-gray-900">{data.venueText}</p>
              </div>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </main>
    </MobileContainer>
  );
}