"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Calendar,
  Building,
  Mail,
  Phone,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface StudioClientInfo {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface PendingEvent {
  id: string;
  name: string;
  slug: string;
  eventDate: string;
  status: string;
  isLive: boolean;
  photosCount: number;
  client: StudioClientInfo;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  events?: PendingEvent[];
  error?: string;
  message?: string;
}

export default function ApprovalRequestsPage() {
  const [requests, setRequests] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // useCallback prevents re-creation and resolves react-hooks/exhaustive-deps
  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events/pending", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const text = await res.text();
      let data: ApiResponse = { success: false };

      try {
        data = text ? (JSON.parse(text) as ApiResponse) : { success: false };
      } catch (parseErr) {
        console.error("JSON parsing error:", parseErr);
      }

      if (res.ok && data.success && Array.isArray(data.events)) {
        setRequests(data.events);
      } else {
        setRequests([]);
      }
    } catch (err: unknown) {
      console.error("Failed to load requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialFetch() {
      if (isMounted) {
        await loadRequests();
      }
    }

    initialFetch();

    return () => {
      isMounted = false;
    };
  }, [loadRequests]);

  const handleAction = async (eventId: string, action: "ACCEPT" | "REJECT") => {
    setActionLoading(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const text = await res.text();
      let data: ApiResponse = { success: false };

      try {
        data = text ? (JSON.parse(text) as ApiResponse) : { success: false };
      } catch (parseErr) {
        console.error("Response parsing error:", parseErr);
      }

      if (res.ok && data.success) {
        setRequests((prev) => prev.filter((r) => r.id !== eventId));
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(null);
        }
      } else {
        alert(data.error || "Action failed to execute.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      alert(`Action error: ${errorMsg}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#030712] min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Live Approval Queue
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Event Approval Requests
          </h1>
          <p className="text-xs text-slate-400">
            Review event verification requests sent by studio partners before going live.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadRequests()}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4">
        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            <span className="text-xs">Fetching pending studio requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-300">All caught up! No pending requests.</p>
            <p className="text-xs text-slate-600">
              When studio photographers create new events, they will appear here for verification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-extrabold">EVENT NAME &amp; DATE</th>
                  <th className="px-4 py-3 font-extrabold">STUDIO PARTNER</th>
                  <th className="px-4 py-3 font-extrabold">PHOTOS</th>
                  <th className="px-4 py-3 font-extrabold">REQUESTED ON</th>
                  <th className="px-4 py-3 text-center font-extrabold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-4">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        {req.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        {new Date(req.eventDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {req.client.name}
                      </div>
                      <span className="text-[11px] text-slate-500">Rep: {req.client.contactPerson}</span>
                    </td>

                    <td className="px-4 py-4 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{req.photosCount} Uploads</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-500 font-mono">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* 1. VIEW BUTTON */}
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(req)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-700/60"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span>View</span>
                        </button>

                        {/* 2. REJECT BUTTON */}
                        <button
                          type="button"
                          disabled={actionLoading === req.id}
                          onClick={() => void handleAction(req.id, "REJECT")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        {/* 3. ACCEPT BUTTON */}
                        <button
                          type="button"
                          disabled={actionLoading === req.id}
                          onClick={() => void handleAction(req.id, "ACCEPT")}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 shadow-sm shadow-emerald-500/10"
                        >
                          {actionLoading === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Accept</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW MODAL POPUP */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#080c14] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedEvent.name}</h3>
                  <p className="text-xs text-slate-400">Slug: /{selectedEvent.slug}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-500 hover:text-white text-sm p-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                  Studio Information
                </div>
                <div className="font-semibold text-white text-sm">{selectedEvent.client.name}</div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5" /> {selectedEvent.client.email}
                </div>
                {selectedEvent.client.phone && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5" /> {selectedEvent.client.phone}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Event Date</span>
                  <span className="font-semibold text-white mt-1 block">
                    {new Date(selectedEvent.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Current Uploads</span>
                  <span className="font-semibold text-pink-400 mt-1 block">
                    {selectedEvent.photosCount} Photos
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => void handleAction(selectedEvent.id, "REJECT")}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl cursor-pointer"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={() => void handleAction(selectedEvent.id, "ACCEPT")}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Accept &amp; Publish Live
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}