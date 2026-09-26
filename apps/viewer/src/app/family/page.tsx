"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FamilyPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFamily() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;

        if (json?.success && Array.isArray(json?.event?.familyMembers) && json.event.familyMembers.length > 0) {
          setMembers(json.event.familyMembers);
        } else {
          // Fallback demo members if none entered
          setMembers([
            { id: 1, name: "Rajesh & Sunita", relation: "Parents", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400" },
            { id: 2, name: "Aman Sharma", relation: "Brother", photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400" },
          ]);
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
      {/* Header */}
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
              className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md"
            >
              <img
                src={member.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
                alt={member.name}
                className="h-36 w-full rounded-2xl object-cover"
              />
              <div className="mt-3 text-center">
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-xs text-amber-700">{member.relation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}