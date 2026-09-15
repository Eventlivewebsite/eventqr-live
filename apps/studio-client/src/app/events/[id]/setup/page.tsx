"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  ImageIcon,
} from "lucide-react";

interface StudioEvent {
  id: string;
  name: string;
  slug: string;
  type?: string;
  eventType?: string;
  eventDate?: string;
  status?: string;
  isLive?: boolean;
  photos?: any[];
  albumsCount?: number;
}

export default function MyLiveEventsPage() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({ success: false, events: [] }));
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      } else if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("[FETCH_STUDIO_EVENTS_ERR]:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchEvents();
    }
  }, [mounted, fetchEvents]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-[#030712] min-h-screen text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight">
              My Live Events
            </h1>
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin approved events are ready to configure viewer feeds and upload initial studio media.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchEvents}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/events/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-pink-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Event Request</span>
          </Link>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="p-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="text-xs">Loading studio events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-[#080c14] border border-slate-800 rounded-3xl space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-slate-700" />
          <p className="text-sm font-bold text-slate-300">No events found</p>
          <p className="text-xs text-slate-600">
            Submit your first event request to begin live guest photo streaming.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const rawStatus = String(event.status || "").toUpperCase();
            const isApproved = event.isLive || rawStatus === "APPROVED";
            const isRejected = rawStatus === "REJECTED";

            return (
              <div
                key={event.id}
                className="p-6 bg-[#080c14] border border-slate-800/80 hover:border-pink-500/40 rounded-3xl transition space-y-5 flex flex-col justify-between shadow-2xl"
              >
                <div className="space-y-3">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800/80 text-slate-300 border border-slate-700 uppercase">
                      {event.eventType || event.type || "WEDDING"}
                    </span>

                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3" /> Pending Approval
                      </span>
                    )}
                  </div>

                  {/* Title & Slug */}
                  <div>
                    <h3 className="text-xl font-black text-white truncate">
                      {event.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                      /{event.slug}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                    <span suppressHydrationWarning>
                      Date: {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                      <span>{Array.isArray(event.photos) ? event.photos.length : (event.albumsCount ?? 0)} Media</span>
                    </span>
                  </div>
                </div>

                {/* FORCE-RENDER SETUP BUTTON */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <Link
                    href={`/events/${event.id}/setup`}
                    className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:opacity-95 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-pink-500/25 group cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Complete Setup &amp; Manage Event</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <a
                    href={`/viewer/${event.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Preview Big Screen Feed</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}