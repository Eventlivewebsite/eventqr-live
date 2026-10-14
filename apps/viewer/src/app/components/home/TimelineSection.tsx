"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, CheckCircle2 } from "lucide-react";

export default function TimelineSection() {
  const [timelines, setTimelines] = useState<any[]>([]);

  useEffect(() => {
    async function loadTimelines() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();
        const items = json?.event?.customFields?.timelines || json?.event?.timelines;
        if (Array.isArray(items) && items.length > 0) {
          setTimelines(items);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadTimelines();
  }, []);

  if (timelines.length === 0) return null;

  return (
    <div className="px-4 py-6 border-t border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          Event Timeline
        </h2>
      </div>

      <div className="space-y-3">
        {timelines.map((item, index) => {
          const status = (item.statusText || item.status || "UPCOMING").toUpperCase();
          const isLive = status === "LIVE";
          const isCompleted = status === "COMPLETED";

          return (
            <div
              key={item.id || index}
              className={`p-3.5 rounded-2xl border transition ${
                isLive
                  ? "bg-red-500/10 border-red-500/30 text-white"
                  : isCompleted
                  ? "bg-white/[0.02] border-white/5 text-white/50"
                  : "bg-white/[0.04] border-white/10 text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{item.title}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isLive
                      ? "bg-red-500 text-white animate-pulse"
                      : isCompleted
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-400/20 text-amber-300"
                  }`}
                >
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/60 mt-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.timeText || item.time || "Scheduled"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
