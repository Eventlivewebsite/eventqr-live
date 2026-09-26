"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import MobileContainer from "../components/layout/MobileContainer";
import BottomNavigation from "../components/navigation/BottomNavigation";

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
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
            { id: 1, name: "Rajesh Sharma", relation: "Father", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", instagramUrl: "https://instagram.com" },
            { id: 2, name: "Sunita Sharma", relation: "Mother", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400" },
            { id: 3, name: "Aman Sharma", relation: "Brother", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", instagramUrl: "https://instagram.com", facebookUrl: "https://facebook.com" },
            { id: 4, name: "Sneha Verma", relation: "Sister", photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", instagramUrl: "https://instagram.com" }
          ]);
        }
      } catch {}
    }
    loadFamily();
  }, []);

  return (
    <MobileContainer>
      <main className="min-h-screen pb-28 text-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/90 px-4 py-3.5 backdrop-blur-md">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-900 shadow-sm active:scale-95 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-bold text-gray-900">Family Members</h1>
          <div className="h-10 w-10" />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3.5">
            {members.map((member) => (
              <div
                key={member.id}
                className="overflow-hidden rounded-[26px] border border-white/80 bg-white p-3 shadow-md"
              >
                <img
                  src={member.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
                  alt={member.name}
                  className="h-36 w-full rounded-2xl object-cover"
                />
                <div className="mt-2.5 text-center">
                  <h3 className="font-bold text-gray-900 text-xs line-clamp-1">{member.name}</h3>
                  <p className="text-[11px] text-amber-700 font-semibold">{member.relation}</p>
                  
                  {(member.instagramUrl || member.facebookUrl) && (
                    <div className="flex items-center justify-center gap-2 mt-2 pt-1 border-t border-gray-100">
                      {member.instagramUrl && (
                        <a
                          href={member.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition"
                        >
                          <InstagramIcon size={14} />
                        </a>
                      )}
                      {member.facebookUrl && (
                        <a
                          href={member.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <FacebookIcon size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNavigation />
      </main>
    </MobileContainer>
  );
}