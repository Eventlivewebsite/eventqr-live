"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";

export default function InvitationDetails() {
  const [details, setDetails] = useState({
    title: "Wedding Details",
    date: "15 February 2027",
    time: "07:00 PM Onwards",
    venue: "Jaipur Palace, Rajasthan",
  });

  useEffect(() => {
    async function loadInvite() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;

        if (json?.success && json?.event) {
          const ev = json.event;
          const formattedDate = ev.eventDate
            ? new Date(ev.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
            : "Special Day";

          setDetails({
            title: `${ev.title || "Celebration"} Details`,
            date: formattedDate,
            time: "Evening 07:00 PM",
            venue: ev.location || "Celebration Venue",
          });
        }
      } catch {}
    }
    loadInvite();
  }, []);

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-xl">
      <h2 className="mb-6 text-center text-2xl font-bold">{details.title}</h2>

      <div className="space-y-5">
        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
          <div className="rounded-xl bg-amber-100 p-3">
            <CalendarDays size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <h3 className="font-semibold text-gray-900">{details.date}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
          <div className="rounded-xl bg-amber-100 p-3">
            <Clock3 size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <h3 className="font-semibold text-gray-900">{details.time}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
          <div className="rounded-xl bg-amber-100 p-3">
            <MapPin size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Venue</p>
            <h3 className="font-semibold text-gray-900">{details.venue}</h3>
          </div>
        </div>
      </div>
    </section>
  );
}