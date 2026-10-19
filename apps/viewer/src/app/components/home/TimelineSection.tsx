"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar } from "lucide-react";

export default function TimelineSection() {
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        
        if (json?.success && Array.isArray(json?.event?.timelines) && json.event.timelines.length > 0) {
          const mapped = json.event.timelines.map((item: any, idx: number) => {
            const rawStatus = (item.statusText || item.status || "UPCOMING").toUpperCase();
            let status = "UPCOMING";
            let color = "bg-amber-500";
            let badgeBg = "bg-amber-50 text-amber-700 border-amber-200";

            if (rawStatus.includes("LIVE")) {
              status = "LIVE";
              color = "bg-rose-500 animate-pulse";
              badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
            } else if (rawStatus.includes("COMPLET")) {
              status = "COMPLETED";
              color = "bg-emerald-500";
              badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
            }

            return {
              id: item.id || idx + 1,
              status,
              title: item.title || "Program",
              time: item.timeText || item.time || (item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD"),
              color,
              badgeBg,
            };
          });
          setTimelineEvents(mapped);
        }
      } catch (e) {
        console.error("Timeline load error", e);
      }
    }
    loadTimeline();
  }, []);

  if (timelineEvents.length === 0) return null;

  return (
    <section className="mt-6 px-4">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-amber-600" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800">
          Schedule & Timings
        </h2>
      </div>

      <div className="space-y-2">
        {timelineEvents.map((ev) => (
          <div
            key={ev.id}
            className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-white px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition hover:border-amber-300"
          >
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${ev.color} flex-shrink-0`} />
              <div>
                <h4 className="text-[13px] font-bold text-stone-800 leading-tight">
                  {ev.title}
                </h4>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-stone-500">
                  <Clock size={11} className="text-stone-400" />
                  {ev.time}
                </div>
              </div>
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${ev.badgeBg}`}>
              {ev.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
