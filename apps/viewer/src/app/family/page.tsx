"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Users, Instagram, Facebook, Crown, Sparkles, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "../components/layout/MobileContainer";
import BottomNavigation from "../components/navigation/BottomNavigation";

interface Member {
  name?: string;
  personName?: string;
  role?: string;
  relation?: string;
  photo?: string;
  photoUrl?: string;
  avatar?: string;
  image?: string;
  instagram?: string;
  instagramLink?: string;
  insta?: string;
  facebook?: string;
  facebookLink?: string;
  fb?: string;
  description?: string;
  note?: string;
  isVip?: boolean;
  vip?: boolean;
}

// Relation ke hisaab se default rich blessings
function getRelationBlessing(role: string, customDesc?: string): string {
  if (customDesc && customDesc.trim()) return customDesc.trim();
  const lower = (role || "").toLowerCase();
  if (lower.includes("father") || lower.includes("dad") || lower.includes("papa")) {
    return "Pillar of strength, wisdom, and guiding light of the family.";
  }
  if (lower.includes("mother") || lower.includes("mom") || lower.includes("maa")) {
    return "Heart of unconditional warmth, boundless love, and gentle blessings.";
  }
  if (lower.includes("brother") || lower.includes("bhai")) {
    return "Everlasting support, energy, and festive celebrations.";
  }
  if (lower.includes("sister") || lower.includes("didi") || lower.includes("behan")) {
    return "Spreading joy, sweetness, and cherished shared memories.";
  }
  if (lower.includes("host") || lower.includes("coordinator")) {
    return "Bringing the entire family together to create timeless memories.";
  }
  if (lower.includes("grandfather") || lower.includes("grandmother") || lower.includes("dada") || lower.includes("dadi") || lower.includes("nana") || lower.includes("nani")) {
    return "The roots of tradition, rich heritage, and enduring eternal blessings.";
  }
  return "Blessing the auspicious celebration with immense joy and love.";
}

function normalizeUrl(url?: string, platform?: "insta" | "fb"): string | null {
  if (!url || !url.trim()) return null;
  let clean = url.trim();
  if (clean.startsWith("@")) clean = clean.substring(1);
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    if (platform === "insta") return `https://instagram.com/${clean}`;
    if (platform === "fb") return `https://facebook.com/${clean}`;
    return `https://${clean}`;
  }
  return clean;
}

export default function FamilyPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFamily() {
      try {
        const sp = new URLSearchParams(window.location.search);
        let s = sp.get("event") || sp.get("slug") || "";
        if (!s && typeof window !== "undefined") {
          s = sessionStorage.getItem("active_event_slug") || "";
        }
        if (s && typeof window !== "undefined") {
          sessionStorage.setItem("active_event_slug", s);
        }

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(s)}&_t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();

        if (json?.success && json?.event) {
          const raw = json.event.familyMembers || json.event.customMap?.familyMembers || json.event.customMap?.keyPeople || [];
          if (Array.isArray(raw) && raw.length > 0) {
            setMembers(raw);
          }
        }
      } catch (err) {
        console.error("Family page load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFamily();
  }, []);

  return (
    <MobileContainer>
      <main className="min-h-screen pb-32 text-gray-900 bg-[#fdfbf7]">
        {/* Sticky Mobile Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-amber-100/70 bg-white/90 px-4 py-3.5 backdrop-blur-md">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-950 shadow-xs active:scale-90 transition duration-150 border border-amber-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-extrabold text-stone-900 flex items-center justify-center gap-1.5 leading-tight">
              Family & VIPs
            </h1>
            <p className="text-[10px] text-amber-700 font-semibold tracking-wide uppercase">
              Pillars of Love & Blessings
            </p>
          </div>
          <div className="h-10 w-10" />
        </div>

        {/* Member Cards List */}
        <div className="p-4 space-y-5">
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="mt-2 text-xs font-semibold text-stone-400">Loading family members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="py-24 text-center space-y-2">
              <Users size={36} className="mx-auto text-stone-300" />
              <p className="text-xs font-bold text-stone-500">No family members added yet.</p>
            </div>
          ) : (
            members.map((m, idx) => {
              const name = m.name || m.personName || "Family Member";
              const role = m.role || m.relation || "VIP Family";
              const photoUrl = m.photo || m.photoUrl || m.avatar || m.image || "";
              
              const isVip = Boolean(
                m.isVip || 
                m.vip || 
                role.toLowerCase().includes("vip") || 
                role.toLowerCase().includes("host")
              );

              const blessingText = getRelationBlessing(role, m.description || m.note);

              const instaUrl = normalizeUrl(m.instagram || m.instagramLink || m.insta, "insta");
              const fbUrl = normalizeUrl(m.facebook || m.facebookLink || m.fb, "fb");

              return (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-[30px] bg-white transition-all duration-300 shadow-sm ${
                    isVip 
                      ? "border-2 border-amber-400/90 shadow-[0_10px_30px_rgba(245,158,11,0.18)]" 
                      : "border border-stone-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] w-full bg-stone-900 overflow-hidden">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950 text-stone-400">
                        <Users size={52} className="stroke-[1.2]" />
                        <span className="text-[10px] font-bold text-stone-500 mt-1 uppercase tracking-wider">Family Member</span>
                      </div>
                    )}

                    {/* Gradient Scrim for readable text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                    {/* Top VIP Crown Badge if checked/VIP */}
                    {isVip && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-md">
                        <Crown size={12} className="fill-amber-950 text-amber-950 animate-bounce" />
                        VIP Honor
                      </div>
                    )}

                    {/* Role Pill & Name on Image Base */}
                    <div className="absolute bottom-3.5 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-xs backdrop-blur-md ${
                          isVip 
                            ? "bg-amber-400 text-stone-950" 
                            : "bg-white/90 text-stone-900"
                        }`}>
                          {isVip && <Sparkles size={10} className="fill-stone-950" />}
                          {role}
                        </span>
                      </div>
                      <h2 className="mt-1.5 text-xl font-black text-white leading-tight drop-shadow-sm">
                        {name}
                      </h2>
                    </div>
                  </div>

                  {/* Card Content & Action Area */}
                  <div className="p-4 space-y-3.5 bg-gradient-to-b from-white to-[#fcfbf9]">
                    {/* Blessing / Custom Description */}
                    <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/60 p-3 border border-amber-100/60">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-100/80 text-rose-600">
                        <Heart size={12} className="fill-rose-500 text-rose-500" />
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed text-stone-700">
                        {blessingText}
                      </p>
                    </div>

                    {/* Social Connect Buttons */}
                    {(instaUrl || fbUrl) ? (
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                        {instaUrl && (
                          <a
                            href={instaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 py-2.5 px-3 text-xs font-black text-white shadow-xs hover:opacity-95 active:scale-95 transition duration-150"
                          >
                            <Instagram size={14} />
                            <span>Instagram</span>
                            <ExternalLink size={11} className="opacity-80" />
                          </a>
                        )}

                        {fbUrl && (
                          <a
                            href={fbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#1877F2] py-2.5 px-3 text-xs font-black text-white shadow-xs hover:bg-[#166fe5] active:scale-95 transition duration-150"
                          >
                            <Facebook size={14} />
                            <span>Facebook</span>
                            <ExternalLink size={11} className="opacity-80" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10px] font-semibold text-stone-400 pt-1 border-t border-stone-100">
                        <span>Pillar of Family</span>
                        <span className="text-amber-700 font-bold">#TogetherForever</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <BottomNavigation />
      </main>
    </MobileContainer>
  );
}