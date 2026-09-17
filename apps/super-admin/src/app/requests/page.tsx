"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  Calendar,
  Building,
  Mail,
  Phone,
  Sparkles,
  RefreshCw,
  Filter,
  Check,
  Search,
  AlertTriangle,
  ExternalLink,
  Tag,
  Globe,
  Radio,
} from "lucide-react";

interface StudioClientInfo {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
}

interface EventRequest {
  id: string;
  name: string;
  title: string;
  slug: string;
  type?: string;
  eventDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  isLive: boolean;
  photosCount?: number;
  client?: StudioClientInfo;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  events?: EventRequest[];
  error?: string;
  message?: string;
}

export default function ApprovalRequestsPage() {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [selectedStudio, setSelectedStudio] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const sanitize = (str: string | undefined | null): string => {
    if (!str) return "";
    return String(str).trim();
  };

  // Fetch Requests
  const loadRequests = useCallback(async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetch("/api/events/pending", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        setErrorBanner(`Server communication failed with status ${res.status}`);
        setRequests([]);
        return;
      }

      const data: ApiResponse = await res.json().catch(() => ({
        success: false,
        events: [],
      }));

      if (data.success && Array.isArray(data.events)) {
        setRequests(data.events);
      } else {
        setRequests([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorBanner(`Secure fetch error: ${msg}`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      void loadRequests();
    }
    return () => {
      isMounted = false;
    };
  }, [loadRequests]);

  // Action Handler (ACCEPT or REJECT)
  const handleAction = async (eventId: string, action: "ACCEPT" | "REJECT") => {
    const cleanId = sanitize(eventId);
    if (!cleanId || !/^[a-zA-Z0-9_-]+$/.test(cleanId)) {
      alert("Invalid Event ID format.");
      return;
    }

    setActionLoading(cleanId);
    const targetStatus = action === "ACCEPT" ? "APPROVED" : "REJECTED";
    const targetLive = action === "ACCEPT";

    try {
      const res = await fetch(`/api/events/approve/${encodeURIComponent(cleanId)}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ action }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data: ApiResponse = await res.json().catch(() => ({ success: false }));

      if (res.ok && data.success) {
        // Update state in UI immediately
        setRequests((prev) =>
          prev.map((req) =>
            req.id === cleanId
              ? { ...req, status: targetStatus, isLive: targetLive }
              : req
          )
        );

        if (selectedEvent?.id === cleanId) {
          setSelectedEvent((prev) =>
            prev ? { ...prev, status: targetStatus, isLive: targetLive } : null
          );
        }
      } else {
        alert(data.error || data.message || "Failed to execute state transition.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      alert(`Action error: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  const uniqueStudios = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    requests.forEach((r) => {
      const sId = sanitize(r.client?.id) || "unassigned";
      const sName = sanitize(r.client?.name) || "Studio Partner";
      if (!map.has(sId)) {
        map.set(sId, { id: sId, name: sName, count: 0 });
      }
      map.get(sId)!.count += 1;
    });
    return Array.from(map.values());
  }, [requests]);

  const stats = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter(
        (r) => r.status === "PENDING" || (!r.isLive && r.status !== "REJECTED")
      ).length,
      approved: requests.filter((r) => r.status === "APPROVED" || r.isLive).length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const isApproved = req.status === "APPROVED" || req.isLive;
      const isRejected = req.status === "REJECTED";
      const isPending = !isApproved && !isRejected;

      if (statusFilter === "PENDING" && !isPending) return false;
      if (statusFilter === "APPROVED" && !isApproved) return false;
      if (statusFilter === "REJECTED" && !isRejected) return false;

      if (selectedStudio !== "ALL") {
        const currentStudioId = sanitize(req.client?.id) || "unassigned";
        if (currentStudioId !== selectedStudio) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const evName = (req.name || req.title || "").toLowerCase();
        const evSlug = (req.slug || "").toLowerCase();
        const stName = (req.client?.name || "").toLowerCase();

        if (
          !evName.includes(query) &&
          !evSlug.includes(query) &&
          !stName.includes(query)
        ) {
          return false;
        }
      }

      if (dateFilter) {
        const evDate = req.eventDate ? req.eventDate.split("T")[0] : "";
        if (evDate !== dateFilter) return false;
      }

      return true;
    });
  }, [requests, statusFilter, selectedStudio, searchQuery, dateFilter]);

  const guestBaseUrl =
    process.env.NEXT_PUBLIC_CLIENT_URL ||
    (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      ? "https://eventqr-live-admin.vercel.app"
      : "http://localhost:3002");

  return (
    <div className="p-8 space-y-6 bg-[#030712] min-h-screen text-slate-100 font-sans selection:bg-pink-500 selection:text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Real-Time Approval &amp; Verification Center
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Event Approval Queue &amp; Audit
          </h1>
          <p className="text-xs text-slate-400">
            Review, inspect, authorize, or return events submitted across all studio branches.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadRequests()}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-pink-500" : ""}`} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Error Alert Display */}
      {errorBanner && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-slate-900 border-pink-500/50 shadow-lg shadow-pink-500/5"
              : "bg-[#080c14] border-slate-800/80 hover:border-slate-700"
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            All Requests
          </span>
          <span className="text-2xl font-black text-white mt-1 block">{stats.all}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("PENDING")}
          className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
            statusFilter === "PENDING"
              ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5"
              : "bg-[#080c14] border-slate-800/80 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Pending Review
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{stats.pending}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("APPROVED")}
          className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
            statusFilter === "APPROVED"
              ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
              : "bg-[#080c14] border-slate-800/80 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Approved &amp; Live
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{stats.approved}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("REJECTED")}
          className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
            statusFilter === "REJECTED"
              ? "bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/5"
              : "bg-[#080c14] border-slate-800/80 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              Rejected
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-400 mt-1 block">{stats.rejected}</span>
        </button>
      </div>

      {/* Query Filters */}
      <div className="p-4 bg-[#080c14] border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event or studio..."
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none w-56 focus:border-pink-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStudio}
              onChange={(e) => setSelectedStudio(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-pink-500 cursor-pointer"
            >
              <option value="ALL">All Studios ({requests.length})</option>
              {uniqueStudios.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.count})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-pink-500 cursor-pointer"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="text-slate-500 hover:text-white text-[10px] font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="text-slate-500 text-[11px] font-mono">
          Showing <span className="text-white font-bold">{filteredRequests.length}</span> of{" "}
          <span className="text-white font-bold">{requests.length}</span> records
        </div>
      </div>

      {/* Main Table */}
      <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4">
        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            <span className="text-xs">Synchronizing real-time queue...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <Filter className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No events match your criteria</p>
            <p className="text-xs text-slate-600">
              Adjust tab filters, select another studio partner, or clear the date picker.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-extrabold">EVENT NAME &amp; SLUG</th>
                  <th className="px-4 py-3 font-extrabold">STUDIO ADMIN</th>
                  <th className="px-4 py-3 font-extrabold">EVENT DATE</th>
                  <th className="px-4 py-3 font-extrabold">CURRENT STATUS</th>
                  <th className="px-4 py-3 font-extrabold">AUDIT STAGE</th>
                  <th className="px-4 py-3 text-right font-extrabold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredRequests.map((req) => {
                  const isApproved = req.status === "APPROVED" || req.isLive;
                  const isRejected = req.status === "REJECTED";

                  return (
                    <tr key={req.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-4 py-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                          <span>{req.name || req.title || "Untitled Event"}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          /{req.slug}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{req.client?.name || "Studio Client"}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                          {req.client?.email || "studio@eventqr.live"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {req.eventDate ? new Date(req.eventDate).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> APPROVED &amp; LIVE
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> REJECTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                            <Clock className="w-3 h-3" /> PENDING REVIEW
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs font-mono">
                        {isApproved ? (
                          <span className="text-emerald-400/80">Active on Guest Screens</span>
                        ) : isRejected ? (
                          <span className="text-rose-400/80">Returned for Correction</span>
                        ) : (
                          <span className="text-slate-500">Awaiting Super Admin</span>
                        )}
                      </td>

                      {/* Actions: Approve button disables after approval, Reject stays active */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedEvent(req)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-700/60"
                            title="Inspect Event Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                            <span>View</span>
                          </button>

                          {/* REJECT BUTTON (Disabled only if already rejected) */}
                          <button
                            type="button"
                            disabled={actionLoading === req.id || isRejected}
                            onClick={() => void handleAction(req.id, "REJECT")}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                              isRejected
                                ? "bg-rose-500/5 text-rose-500/30 border-rose-500/10 cursor-not-allowed opacity-50"
                                : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20 cursor-pointer"
                            }`}
                            title={isRejected ? "Already Rejected" : "Reject Request"}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          {/* APPROVE BUTTON (Disabled if already approved/live) */}
                          <button
                            type="button"
                            disabled={actionLoading === req.id || isApproved}
                            onClick={() => void handleAction(req.id, "ACCEPT")}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                              isApproved
                                ? "bg-emerald-500/10 text-emerald-500/40 border-emerald-500/20 cursor-not-allowed opacity-60"
                                : "bg-emerald-500 hover:bg-emerald-600 text-black border-emerald-400 cursor-pointer shadow-sm"
                            }`}
                            title={isApproved ? "Already Approved & Live" : "Approve & Publish Live"}
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>{isApproved ? "Approved" : "Accept"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AUDIT MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#080c14] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {selectedEvent.name || selectedEvent.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase">
                      {selectedEvent.type || "WEDDING"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>/{selectedEvent.slug}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Event Specification
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    ID: {selectedEvent.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Scheduled Event Date</span>
                    <span className="font-semibold text-white">
                      {selectedEvent.eventDate
                        ? new Date(selectedEvent.eventDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Submitted On</span>
                    <span className="font-semibold text-white">
                      {selectedEvent.createdAt
                        ? new Date(selectedEvent.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Live Status</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        selectedEvent.status === "APPROVED" || selectedEvent.isLive
                          ? "text-emerald-400"
                          : selectedEvent.status === "REJECTED"
                          ? "text-rose-400"
                          : "text-amber-400"
                      }`}
                    >
                      <Radio className="w-3 h-3" />
                      {selectedEvent.status === "APPROVED" || selectedEvent.isLive
                        ? "PUBLISHED & LIVE"
                        : selectedEvent.status === "REJECTED"
                        ? "REJECTED"
                        : "PENDING VERIFICATION"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Upload Count</span>
                    <span className="font-semibold text-white">
                      {selectedEvent.photosCount ?? 0} Media items
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                  Studio Partner Origin
                </span>
                <div className="font-bold text-white text-sm">
                  {selectedEvent.client?.name || "Studio Partner"}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedEvent.client?.email || "studio@eventqr.live"}</span>
                  </div>
                  {selectedEvent.client?.phone && selectedEvent.client.phone !== "N/A" && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedEvent.client.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedEvent.status === "APPROVED" || selectedEvent.isLive) && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold">
                    Guest link is active and accessible.
                  </span>
                  <a
                    href={`${guestBaseUrl}/e/${selectedEvent.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                  >
                    <span>Open Live Stream</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={Boolean(actionLoading) || selectedEvent.status === "REJECTED"}
                  onClick={() => void handleAction(selectedEvent.id, "REJECT")}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={Boolean(actionLoading) || selectedEvent.status === "APPROVED" || selectedEvent.isLive}
                  onClick={() => void handleAction(selectedEvent.id, "ACCEPT")}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {selectedEvent.status === "APPROVED" || selectedEvent.isLive ? "Approved" : "Approve & Publish Live"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}