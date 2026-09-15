"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, QrCode, Radio, ArrowUpRight, 
  HardDrive, Users, Eye, Sparkles, Loader2, 
  ShieldCheck, Lock, Unlock, SlidersHorizontal
} from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  isLive: boolean;
  qrEnabled: boolean;
  accessMode: "PUBLIC" | "PRIVATE";
  eventDate: string | null;
  _count?: { albums: number };
}

export default function StudioDashboardPage() {
  const [client, setClient] = useState<any>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Session & Events
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const session = localStorage.getItem("studio_client_session");
      if (!session) {
        window.location.href = "/login";
        return;
      }

      const clientData = JSON.parse(session);
      setClient(clientData);

      const res = await fetch(`/api/events?clientId=${clientData.id}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Quick Live Toggle directly from Dashboard
  const handleQuickLiveToggle = async (eventId: string, currentLiveStatus: boolean) => {
    try {
      const res = await fetch("/api/viewer-controls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          isLive: !currentLiveStatus,
        }),
      });

      if (res.ok) {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === eventId ? { ...ev, isLive: !currentLiveStatus } : ev))
        );
      }
    } catch (err) {
      alert("Failed to toggle live state.");
    }
  };

  const activeEventsCount = events.filter((e) => e.isLive).length;

  return (
    <div className="p-8 space-y-8 bg-[#030712] min-h-screen text-slate-100">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-gradient-to-r from-[#0b0f19] to-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-pink-500/20 text-pink-400 rounded-xl border border-pink-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {client?.companyName || "Studio"} Overview
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Welcome back, <span className="text-slate-200 font-bold">{client?.contactPerson || "Partner"}</span>. Manage your real-time viewer stream and QR standees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/viewer-controls"
            className="flex items-center gap-2 px-5 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-600/30 transition text-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Viewer Command Center</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Events</span>
            <Calendar className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-3xl font-black text-white">{events.length}</div>
          <p className="text-[11px] text-slate-500">Created under your studio</p>
        </div>

        <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Live Broadcasts</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{activeEventsCount}</div>
          <p className="text-[11px] text-slate-500">Currently active on viewer screens</p>
        </div>

        <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Storage Allocated</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{client?.storageLimitGB || 50} GB</div>
          <p className="text-[11px] text-slate-500">High-speed media tier</p>
        </div>

        <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Account Plan</span>
            <ShieldCheck className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-3xl font-black text-pink-500 uppercase text-xl mt-1">
            {client?.plan || "PREMIUM"}
          </div>
          <p className="text-[11px] text-slate-500">Active status</p>
        </div>
      </div>

      {/* Events Table & Control Grid */}
      <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Your Events & Viewer Status</h2>
            <p className="text-xs text-slate-400">Toggle live state or launch viewer screen directly</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-pink-500" /> Fetching your studio events...
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p>No events found for your studio.</p>
            <p className="text-xs text-slate-600">Create an event to start broadcasting to viewers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">EVENT / TITLE</th>
                  <th className="px-5 py-3.5">EVENT SLUG</th>
                  <th className="px-5 py-3.5">ACCESS MODE</th>
                  <th className="px-5 py-3.5">BROADCAST STATE</th>
                  <th className="px-5 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{ev.title}</div>
                      <div className="text-xs text-slate-500">{ev.type}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-pink-400 text-xs">
                      /event/{ev.slug}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        ev.accessMode === "PUBLIC"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {ev.accessMode === "PUBLIC" ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {ev.accessMode}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleQuickLiveToggle(ev.id, ev.isLive)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition ${
                          ev.isLive
                            ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        <Radio className={`w-3.5 h-3.5 ${ev.isLive ? "animate-pulse" : ""}`} />
                        <span>{ev.isLive ? "LIVE NOW" : "PAUSED"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <Link
                        href="/viewer-controls"
                        className="inline-flex items-center gap-1 p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition"
                        title="Configure Viewer Screen"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Settings</span>
                      </Link>

                      <a
                        href={`http://localhost:3000/event/${ev.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 p-2 bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 rounded-xl text-xs transition"
                        title="Open Live Guest Screen"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View Screen</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}