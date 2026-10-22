"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, Sparkles } from "lucide-react";

export default function TimelineSection() {
  const [timelineEvents, setTimelineEvents] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const sp = new URLSearchParams(window.location.search);
        const s = sp.get("event") || sp.get("slug") || "";
        const c = sessionStorage.getItem("cached_event_data_" + s);
        if (c) {
          const p = JSON.parse(c);
          const raw = p.timelines || p.customMap?.timelines;
          if (Array.isArray(raw) && raw.length > 0) {
            return formatItems(raw);
          }
        }
      } catch {}
    }
    return [];
  });

  function formatItems(raw: any[]) {
    return raw.map((item: any, idx: number) => {
      const rawStatus = (item.statusText || item.status || "UPCOMING").toUpperCase();
      const isLive = rawStatus.includes("LIVE");
      const isCompleted = rawStatus.includes("COMPLET");

      let status = "UPCOMING";
      let theme = {
        bg: "from-[#fffbf5] via-[#fff8ed] to-[#ffeed4]",
        border: "border-amber-200/90 hover:border-amber-400",
        shadow: "shadow-[0_8px_20px_rgba(245,158,11,0.12)]",
        badge: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm",
        dot: "bg-amber-500",
        pulse: "",
        timeTag: "bg-amber-100/80 text-amber-900 border-amber-200",
        timeIcon: "text-amber-600",
      };

      if (isLive) {
        status = "LIVE";
        theme = {
          bg: "from-[#fff5f5] via-[#ffe8ec] to-[#ffd7df]",
          border: "border-rose-300 hover:border-rose-500",
          shadow: "shadow-[0_8px_25px_rgba(244,63,94,0.18)]",
          badge: "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.35)]",
          dot: "bg-rose-500",
          pulse: "animate-ping opacity-75",
          timeTag: "bg-rose-100/90 text-rose-950 border-rose-200",
          timeIcon: "text-rose-600",
        };
      } else if (isCompleted) {
        status = "COMPLETED";
        theme = {
          bg: "from-[#f4fbf7] via-[#e8f7ee] to-[#d6f2e1]",
          border: "border-emerald-200 hover:border-emerald-400",
          shadow: "shadow-[0_8px_20px_rgba(16,185,129,0.12)]",
          badge: "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm",
          dot: "bg-emerald-500",
          pulse: "",
          timeTag: "bg-emerald-100/80 text-emerald-900 border-emerald-200",
          timeIcon: "text-emerald-600",
        };
      }

      return {
        id: item.id || idx + 1,
        status,
        title: item.title || "Program",
        time: item.timeText || item.time || (item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD"),
        theme,
      };
    });
  }

  useEffect(() => {
    async function loadTimeline() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(s)}&_t=${Date.now()}`);
        const json = await res.json();
        
        const raw = json?.event?.timelines || json?.event?.customMap?.timelines;
        if (json?.success && Array.isArray(raw) && raw.length > 0) {
          setTimelineEvents(formatItems(raw));
        }
      } catch (e) {
        console.error("Timeline load error", e);
      }
    }
    loadTimeline();
  }, []);

  if (timelineEvents.length === 0) return null;

  return (
    <section className="mt-4 px-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs">
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
            Schedule & Timings
          </h2>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
          <Sparkles size={11} className="text-amber-500" />
          Live Schedule
        </span>
      </div>

      <div className="space-y-2.5">
        {timelineEvents.map((ev) => (
          <div
            key={ev.id}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-r ${ev.theme.bg} ${ev.theme.border} p-3.5 ${ev.theme.shadow} transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]`}
          >
            {/* Subtle light reflex accent */}
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/60 blur-xl pointer-events-none" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Glowing Dot */}
                <div className="relative flex h-3.5 w-3.5 items-center justify-center flex-shrink-0">
                  {ev.theme.pulse && (
                    <span className={`absolute h-full w-full rounded-full ${ev.theme.dot} ${ev.theme.pulse}`} />
                  )}
                  <span className={`relative h-2.5 w-2.5 rounded-full ${ev.theme.dot} shadow-xs ring-2 ring-white`} />
                </div>

                <div>
                  <h4 className="text-[14px] font-black text-stone-900 leading-tight tracking-tight">
                    {ev.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${ev.theme.timeTag}`}>
                      <Clock size={11} className={ev.theme.timeIcon} />
                      {ev.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Colorful Gradient Status Badge */}
              <div className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${ev.theme.badge}`}>
                {ev.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}