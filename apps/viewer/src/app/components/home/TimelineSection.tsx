"use client";

import { useEffect, useState } from "react";
import PremiumCard from "../ui/PremiumCard";
import { CalendarDays, Clock } from "lucide-react";

export default function TimelineSection() {
  const [timelineEvents, setTimelineEvents] = useState<any[]>([
    { id: 1, status: "LIVE", title: "Wedding Reception", time: "06:00 PM", color: "bg-red-500" },
    { id: 2, status: "UPCOMING", title: "Dinner", time: "08:00 PM", color: "bg-orange-500" },
    { id: 3, status: "COMPLETED", title: "Haldi Ceremony", time: "11:00 AM", color: "bg-green-500" },
  ]);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && Array.isArray(json?.event?.timelines) && json.event.timelines.length > 0) {
          const mapped = json.event.timelines.map((item: any, idx: number) => {
            const status = (item.status || "UPCOMING").toUpperCase();
            let color = "bg-orange-500";
            if (status === "LIVE") color = "bg-red-500";
            if (status === "COMPLETED") color = "bg-green-500";

            return {
              id: item.id || idx + 1,
              status,
              title: item.title || "Special Program",
              time: item.time || (item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD"),
              color,
            };
          });
          setTimelineEvents(mapped);
        }
      } catch {}
    }
    loadTimeline();
  }, []);

  return (
    <section className="mt-8 px-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">📅 Schedule & Timings</h2>
      </div>

      <div className="space-y-3">
        {timelineEvents.map((ev) => (
          <div
            key={ev.id}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${ev.color}`} />
              <div>
                <h4 className="font-semibold text-gray-900">{ev.title}</h4>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {ev.time}
                </div>
              </div>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
              {ev.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}