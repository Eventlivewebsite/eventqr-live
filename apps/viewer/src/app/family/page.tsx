"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Crown, CheckCircle2, Heart, ExternalLink, MessageCircle, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "../components/layout/MobileContainer";
import BottomNavigation from "../components/navigation/BottomNavigation";

interface FamilyMember {
  id: string | number;
  name: string;
  relation: string;
  photoUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  isVip?: boolean;
  description?: string;
}

interface MemberComment {
  name: string;
  text: string;
  time: string;
}

function InstagramIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function FamilyPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [eventName, setEventName] = useState("");
  const [familyPrefix, setFamilyPrefix] = useState("The Family Of");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Real Database Interactions
  const [likes, setLikes] = useState<Record<string | number, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string | number, boolean>>({});
  const [openCommentId, setOpenCommentId] = useState<string | number | null>(null);
  const [comments, setComments] = useState<Record<string | number, MemberComment[]>>({});
  const [commentInput, setCommentInput] = useState("");
  const [guestNameInput, setGuestNameInput] = useState("");

  useEffect(() => {
    async function fetchFamilyData() {
      try {
        setLoading(true);
        const sp = new URLSearchParams(window.location.search);
        let s = sp.get("slug") || sp.get("event") || "";
        if (!s && typeof window !== "undefined") {
          s = sessionStorage.getItem("active_event_slug") || "";
        }

        // Purane event ka naam flash na ho isliye turant reset
        setEventName("");
        setMembers([]);

        if (s) {
          setSlug(s);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("active_event_slug", s);
          }
        }

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(s)}&_t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();

        if (json?.success && json?.event) {
          const name = json.event.name || json.event.title || json.event.groomBride || "";
          setEventName(name);

          if (json.event.customMap?.familyPrefixTitle) {
            setFamilyPrefix(json.event.customMap.familyPrefixTitle);
          }

          if (Array.isArray(json.event.familyMembers)) {
            setMembers(json.event.familyMembers);
          }
        }

        const interRes = await fetch(`/api/family-interactions?slug=${encodeURIComponent(s)}&_t=${Date.now()}`, { cache: "no-store" });
        const interJson = await interRes.json();
        if (interJson?.success) {
          setLikes(interJson.likes || {});
          setComments(interJson.comments || {});
        }
      } catch (err) {
        console.error("Family fetch error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFamilyData();
  }, []);

  const getActiveBlessing = (member: FamilyMember) => {
    if (member.description && member.description.trim()) {
      return member.description.trim();
    }
    const r = (member.relation || "").toLowerCase();
    if (r.includes("father") || r.includes("mother") || r.includes("parent")) {
      return "Pillars of unconditional love, wisdom, and eternal blessings.";
    }
    if (r.includes("brother") || r.includes("sister") || r.includes("sibling")) {
      return "Lifelong partners in laughter, cherished secrets, and joyful celebrations.";
    }
    if (r.includes("friend") || r.includes("best")) {
      return "Bringing boundless cheer, vibrant energy, and unforgettable memories.";
    }
    return "Honored pillar and cherished heart of this celebration.";
  };

  const toggleLike = async (id: string | number) => {
    if (userLiked[id]) return;
    setUserLiked((prev) => ({ ...prev, [id]: true }));
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

    try {
      await fetch("/api/family-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, memberId: id, type: "like" })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (id: string | number) => {
    if (!commentInput.trim()) return;
    const currentName = guestNameInput.trim() || "Guest";
    const currentText = commentInput.trim();

    const optimistic: MemberComment = {
      name: currentName,
      text: currentText,
      time: "Just now"
    };

    setComments((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), optimistic]
    }));
    
    // Comment submit hone ke baad input clear aur auto-close
    setCommentInput("");
    setOpenCommentId(null);

    try {
      await fetch("/api/family-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          memberId: id,
          type: "comment",
          guestName: currentName,
          text: currentText
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatSocialUrl = (handleOrUrl: string, type: "ig" | "fb") => {
    if (!handleOrUrl) return "";
    const clean = handleOrUrl.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    const sanitized = clean.replace(/^@/, "");
    return type === "ig" ? `https://instagram.com/${sanitized}` : `https://facebook.com/${sanitized}`;
  };

  return (
    <MobileContainer>
      <style jsx global>{`
        @keyframes softColorShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-event-heading {
          background: linear-gradient(-45deg, #b45309, #e11d48, #7c3aed, #d97706, #92400e);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: softColorShift 5s ease-in-out infinite;
        }
      `}</style>

      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-amber-100 bg-[#FAF7F2]/95 px-4 py-3 backdrop-blur-md">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50/80 text-stone-800 shadow-xs border border-amber-200/60 transition active:scale-90"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="text-center px-2 flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700/80 block">
              {familyPrefix}
            </span>
            {eventName ? (
              <h1 className="animated-event-heading text-lg font-black tracking-tight leading-tight capitalize">
                {eventName}
              </h1>
            ) : (
              <div className="mx-auto my-1 h-5 w-28 animate-pulse rounded-md bg-amber-200/60" />
            )}
            <p className="text-[10px] font-semibold text-stone-500 tracking-wide mt-0.5">
              Family Members • Pillars of Love & Blessings
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100/50 text-amber-700">
            <Sparkles size={16} />
          </div>
        </header>

        {/* Members Cards Feed: Pure Admin Real Data */}
        <main className="flex-1 px-4 py-4 space-y-4 pb-32">
          {loading ? (
            <div className="py-24 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="mt-3 text-xs font-bold text-stone-500">Loading Family Members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
              <Crown className="mx-auto text-amber-500" size={34} />
              <p className="mt-2 text-sm font-bold text-stone-700">No Family Members Added Yet</p>
              <p className="text-xs text-stone-400 mt-1">Add members from Admin Setup to display here.</p>
            </div>
          ) : (
            members.map((m, idx) => {
              const cardId = m.id !== undefined ? m.id : idx;
              const igLink = formatSocialUrl(m.instagramUrl || "", "ig");
              const fbLink = formatSocialUrl(m.facebookUrl || "", "fb");
              const memberLikes = likes[cardId] || 0;
              const isLiked = !!userLiked[cardId];
              const memberComments = comments[cardId] || [];
              const isCommentOpen = openCommentId === cardId;
              const currentBlessing = getActiveBlessing(m);

              return (
                <div
                  key={cardId}
                  className="group relative overflow-hidden rounded-[26px] bg-white shadow-sm border border-stone-200/80 transition"
                >
                  {/* Photo Frame */}
                  <div className="relative h-64 w-full overflow-hidden bg-stone-900">
                    {m.photoUrl ? (
                      <Image
                        src={m.photoUrl}
                        alt={m.name}
                        fill
                        className="object-cover object-top transition duration-500 group-hover:scale-102"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-amber-900/40 via-stone-900 to-stone-950 text-white">
                        <span className="text-5xl font-black opacity-30 tracking-widest">
                          {m.name ? m.name.charAt(0) : "M"}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent pointer-events-none" />

                    {/* VIP Badge */}
                    {m.isVip && (
                      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 rounded-full bg-amber-400/95 px-3 py-1 text-[11px] font-black text-stone-950 shadow-lg backdrop-blur-xs border border-amber-300">
                        <Crown size={12} className="fill-stone-950" />
                        <span>VIP</span>
                        <CheckCircle2 size={13} className="fill-stone-950 text-amber-400 ml-0.5" />
                      </div>
                    )}

                    {/* Name & Relation */}
                    <div className="absolute bottom-3.5 left-4 right-4 z-10 space-y-1 pointer-events-none">
                      <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md border border-white/25">
                        {m.relation}
                      </span>
                      <h2 className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                        {m.name}
                      </h2>
                    </div>
                  </div>

                  {/* Blessings & Interactions */}
                  <div className="p-4 space-y-3 bg-white">
                    <div className="flex items-start gap-2.5">
                      <Heart size={16} className="mt-0.5 flex-shrink-0 fill-rose-500 text-rose-500" />
                      <p className="text-sm font-semibold text-stone-800 leading-snug italic">
                        &ldquo;{currentBlessing}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleLike(cardId)}
                          className={`flex items-center gap-1.5 text-xs font-bold transition active:scale-90 ${
                            isLiked ? "text-rose-600" : "text-stone-600 hover:text-stone-900"
                          }`}
                        >
                          <Heart
                            size={16}
                            className={`transition ${isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""}`}
                          />
                          <span>{memberLikes}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOpenCommentId(isCommentOpen ? null : cardId)}
                          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 active:scale-95 transition"
                        >
                          <MessageCircle size={16} />
                          <span>{memberComments.length}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {igLink && (
                          <a
                            href={igLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-pink-700 border border-pink-200/60 active:scale-95 transition"
                          >
                            <InstagramIcon size={12} />
                            <span>Instagram</span>
                            <ExternalLink size={9} className="opacity-50" />
                          </a>
                        )}

                        {fbLink && (
                          <a
                            href={fbLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200/60 active:scale-95 transition"
                          >
                            <FacebookIcon size={12} />
                            <span>Facebook</span>
                            <ExternalLink size={9} className="opacity-50" />
                          </a>
                        )}
                      </div>
                    </div>

                    {isCommentOpen && (
                      <div className="mt-3 pt-3 border-t border-stone-100 space-y-2.5">
                        {memberComments.length > 0 ? (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {memberComments.map((c, i) => (
                              <div key={i} className="rounded-xl bg-stone-50 p-2 text-xs">
                                <div className="flex justify-between items-center font-bold text-stone-800">
                                  <span>{c.name}</span>
                                  <span className="text-[10px] text-stone-400 font-normal">{c.time}</span>
                                </div>
                                <p className="text-stone-600 mt-0.5 leading-snug">{c.text}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-stone-400 italic">No wishes posted yet. Be the first to leave a wish!</p>
                        )}

                        <div className="space-y-1.5 bg-stone-50/70 p-2.5 rounded-2xl border border-stone-200/60">
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={guestNameInput}
                            onChange={(e) => setGuestNameInput(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-rose-400"
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="Write a sweet wish..."
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAddComment(cardId)}
                              className="flex-1 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-rose-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(cardId)}
                              className="h-8 w-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs active:scale-95 transition"
                            >
                              <Send size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </main>

        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}
