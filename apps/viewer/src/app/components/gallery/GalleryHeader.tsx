"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Menu, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GalleryHeader() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (s) {
        sessionStorage.setItem("active_event_slug", s);
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`)
          .then((r) => r.json())
          .then((d) => {
            const title = d?.event?.name || d?.event?.title || d?.event?.groomBride || "";
            if (title) setEventName(title);
          })
          .catch(() => {});
      }
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes luxuryColorShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-event-heading {
          background: linear-gradient(-45deg, #d97706, #e11d48, #9333ea, #2563eb, #b45309);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: luxuryColorShift 5s ease-in-out infinite;
        }
      `}</style>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center">
          <h1 className="animated-event-heading text-xl font-black tracking-tight text-center uppercase">
            {eventName || "CELEBRATION"}
          </h1>
          <p className="text-[11px] font-medium text-stone-500">Browse all memories</p>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition active:scale-95"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>
      </header>
    </>
  );
}
