"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import MobileContainer from "../components/layout/MobileContainer";
import BottomNavigation from "../components/navigation/BottomNavigation";

export default function GuestBookPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      name: "Aarav Sharma",
      time: "Just now",
      message: "May your married life always be filled with love, happiness and countless beautiful memories. Congratulations!",
      likes: 24,
    },
    {
      id: 2,
      name: "Priya Verma",
      time: "15 min ago",
      message: "Wishing you both a lifetime of togetherness and pure joy!",
      likes: 18,
    }
  ]);
  const [authorName, setAuthorName] = useState("");
  const [wishMsg, setWishMsg] = useState("");

  useEffect(() => {
    async function loadGuestbook() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && Array.isArray(json?.event?.guestWishes) && json.event.guestWishes.length > 0) {
          setMessages(json.event.guestWishes);
        }
      } catch {}
    }
    loadGuestbook();
  }, []);

  const handlePostWish = () => {
    if (!authorName.trim() || !wishMsg.trim()) return;
    const newEntry = {
      id: Date.now(),
      name: authorName.trim(),
      time: "Just now",
      message: wishMsg.trim(),
      likes: 1,
    };
    setMessages([newEntry, ...messages]);
    setAuthorName("");
    setWishMsg("");
  };

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
          <h1 className="text-base font-bold text-gray-900">Guest Book</h1>
          <div className="h-10 w-10" />
        </div>

        <div className="p-4 space-y-4">
          {/* Post Box */}
          <div className="rounded-[26px] border border-amber-100 bg-white p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-2.5 text-xs">
              <Sparkles size={15} className="text-amber-500" /> Send Blessings
            </h3>
            <input
              type="text"
              placeholder="Your Name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none mb-2 focus:border-amber-400"
            />
            <textarea
              rows={3}
              placeholder="Write your blessings and message..."
              value={wishMsg}
              onChange={(e) => setWishMsg(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none mb-2.5 focus:border-amber-400"
            />
            <button
              onClick={handlePostWish}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-98 transition"
            >
              <Send size={14} /> Post Blessing
            </button>
          </div>

          {/* Feed */}
          <div className="space-y-3">
            {messages.map((item) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-gray-100 bg-white p-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">{item.name}</h4>
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-rose-500 font-bold">
                    <Heart size={13} fill="currentColor" /> {item.likes}
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-700 leading-relaxed">{item.message}</p>
              </div>
            ))}
          </div>
        </div>

        <BottomNavigation />
      </main>
    </MobileContainer>
  );
}