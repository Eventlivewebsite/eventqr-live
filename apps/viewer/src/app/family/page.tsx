"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import MobileContainer from "../components/layout/MobileContainer";
import BottomNavigation from "../components/navigation/BottomNavigation";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export default function FamilyPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    async function loadFamily() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && Array.isArray(json?.event?.familyMembers) && json.event.familyMembers.length > 0) {
          setMembers(json.event.familyMembers);
        } else {
          setMembers([
            { id: 1, name: "Rajesh Sharma", relation: "Father of the Bride", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", instagramUrl: "https://instagram.com" },
            { id: 2, name: "Sunita Sharma", relation: "Mother of the Bride", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800", instagramUrl: "https://instagram.com" },
            { id: 3, name: "Aman Sharma", relation: "Brother", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800", instagramUrl: "https://instagram.com", facebookUrl: "https://facebook.com" },
            { id: 4, name: "Sneha Verma", relation: "Sister", photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800", instagramUrl: "https://instagram.com" }
          ]);
        }
      } catch {}
    }
    loadFamily();
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
            <h1 className="text-base font-bold text-gray-900">Family Members</h1>
            <p className="text-[10px] text-amber-700 font-medium">Pillars of Love & Blessings</p>
          </div>
          <div className="h-10 w-10" />
        </div>

        {/* 1 Photo Per Card Luxury Layout */}
        <div className="p-4 space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="overflow-hidden rounded-[28px] border border-amber-100/80 bg-white shadow-[0_10px_25px_rgba(200,150,100,0.08)] transition hover:shadow-md"
            >
              <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                <img
                  src={member.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"}
                  alt={member.name}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase">
                      {member.relation}
                    </span>
                    <h3 className="text-xl font-bold mt-1 drop-shadow">{member.name}</h3>
                  </div>
                </div>
              </div>

              {/* Social Links & Bio Footer */}
              <div className="p-3.5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Heart size={14} className="text-rose-500 fill-rose-500" />
                  <span>Blessing the Couple</span>
                </div>

                <div className="flex items-center gap-2">
                  {member.instagramUrl && (
                    <a
                      href={member.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition active:scale-95"
                    >
                      <InstagramIcon size={16} />
                    </a>
                  )}
                  {member.facebookUrl && (
                    <a
                      href={member.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition active:scale-95"
                    >
                      <FacebookIcon size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <BottomNavigation />
      </main>
    </MobileContainer>
  );
}