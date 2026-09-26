"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";

// Safe SVG Brand Icons
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFamily() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && Array.isArray(json?.event?.familyMembers)) {
          setMembers(json.event.familyMembers);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFamily();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf5] to-[#fff1e6] pb-24 text-gray-900">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-amber-100 bg-white/80 px-5 py-4 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-900"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">Family Members</h1>
        <div className="h-10 w-10" />
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur-md"
            >
              <img
                src={member.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
                alt={member.name}
                className="h-36 w-full rounded-2xl object-cover"
              />
              <div className="mt-3 text-center">
                <h3 className="font-bold text-gray-900 text-sm">{member.name}</h3>
                <p className="text-xs text-amber-700 font-medium">{member.relation}</p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  {member.instagramUrl && (
                    <a
                      href={member.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition"
                    >
                      <InstagramIcon size={15} />
                    </a>
                  )}
                  {member.facebookUrl && (
                    <a
                      href={member.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    >
                      <FacebookIcon size={15} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}