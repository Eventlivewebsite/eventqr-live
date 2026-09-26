"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Send, Sparkles, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GuestBookPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      name: "Aarav Sharma",
      location: "Jaipur",
      time: "Just now",
      message: "May your journey together be filled with boundless joy, laughter and prosperity!",
      likes: 12,
    },
  ]);
  const [authorName, setAuthorName] = useState("");
  const [wishMsg, setWishMsg] = useState("");
  const [posting, setPosting] = useState(false);

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
    setPosting(true);
    const newEntry = {
      id: Date.now(),
      name: authorName.trim(),
      location: "Guest",
      time: "Just now",
      message: wishMsg.trim(),
      likes: 0,
    };
    setMessages([newEntry, ...messages]);
    setAuthorName("");
    setWishMsg("");
    setPosting(false);
  };

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
        <h1 className="text-lg font-bold">Guest Book</h1>
        <div className="h-10 w-10" />
      </div>

      <div className="p-5 space-y-5">
        {/* Write Wish Box */}
        <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-amber-500" /> Send Warm Wishes
          </h3>
          <input
            type="text"
            placeholder="Your Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none mb-2 focus:ring-2 focus:ring-amber-500"
          />
          <textarea
            rows={3}
            placeholder="Write your blessings and message..."
            value={wishMsg}
            onChange={(e) => setWishMsg(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none mb-3 focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handlePostWish}
            disabled={posting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-white shadow-md transition hover:opacity-95"
          >
            <Send size={16} /> Post Blessing
          </button>
        </div>

        {/* Wishes Feed */}
        <div className="space-y-3">
          {messages.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <span className="text-[11px] text-gray-400">{item.time}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                  <Heart size={14} fill="currentColor" /> {item.likes}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-700">{item.message}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}