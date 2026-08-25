"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Loader2,
  Building,
} from "lucide-react";

interface PendingEventItem {
  id: string;
  name: string;
  eventDate: string;
  client: {
    name: string;
  };
}

interface ClientStatItem {
  storageLimitGB?: number;
  storageUsedGB?: number;
}

interface ClientsApiResponse {
  success?: boolean;
  clients?: ClientStatItem[];
}

interface EventsApiResponse {
  success?: boolean;
  events?: PendingEventItem[];
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingApprovals: 0,
    totalStorageUsed: 0,
    storageLimit: 500,
  });
  const [pendingRequests, setPendingRequests] = useState<PendingEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // useCallback permanently fixes react-hooks/exhaustive-deps
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, pendingRes] = await Promise.all([
        fetch("/api/clients", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        }),
        fetch("/api/events/pending", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        }),
      ]);

      const clientsText = await clientsRes.text();
      const pendingText = await pendingRes.text();

      let clientsData: ClientsApiResponse = {};
      let pendingData: EventsApiResponse = {};

      try {
        clientsData = clientsText ? (JSON.parse(clientsText) as ClientsApiResponse) : {};
        pendingData = pendingText ? (JSON.parse(pendingText) as EventsApiResponse) : {};
      } catch (parseErr) {
        console.error("Dashboard JSON parse error:", parseErr);
      }

      const clients: ClientStatItem[] = Array.isArray(clientsData.clients) ? clientsData.clients : [];
      const pending: PendingEventItem[] = Array.isArray(pendingData.events) ? pendingData.events : [];

      const totalStorage = clients.reduce(
        (acc: number, c: ClientStatItem) => acc + (c.storageUsedGB || 0),
        0
      );
      const totalLimit = clients.reduce(
        (acc: number, c: ClientStatItem) => acc + (c.storageLimitGB || 50),
        0
      );

      setStats({
        totalClients: clients.length,
        pendingApprovals: pending.length,
        totalStorageUsed: totalStorage,
        storageLimit: totalLimit || 500,
      });

      setPendingRequests(pending.slice(0, 5));
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      if (isMounted) {
        await fetchDashboardData();
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  const handleAction = async (eventId: string, action: "ACCEPT" | "REJECT") => {
    try {
      const res = await fetch(`/api/events/${eventId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (e: unknown) {
      console.error("Action error:", e);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#030712] min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-pink-400 font-mono text-xs uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            SUPER ADMIN CONTROL HUB
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Master Overview</h1>
          <p className="text-xs text-slate-400">
            Real-time multi-tenant monitoring, storage quota &amp; approval stream.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchDashboardData()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Studio Clients</span>
            <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalClients}</div>
          <Link
            href="/clients"
            className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 inline-flex"
          >
            <span>Manage Studios</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Approvals</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.pendingApprovals}</div>
          <div className="text-xs text-slate-500 font-medium">
            {stats.pendingApprovals === 0 ? "✓ All caught up" : "Action required"}
          </div>
        </div>

        <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Cloud Storage</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {stats.totalStorageUsed}{" "}
            <span className="text-xs font-normal text-slate-500">/ {stats.storageLimit} GB</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full"
              style={{
                width: `${Math.min(
                  Math.round((stats.totalStorageUsed / (stats.storageLimit || 1)) * 100),
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Security Engine</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">Active</div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Enterprise Guard Protected
          </div>
        </div>
      </div>

      {/* Pending Stream */}
      <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Event Requests Awaiting Approval</h2>
          </div>
          <Link
            href="/requests"
            className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
          >
            <span>View Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
            <span className="text-xs">Loading queue...</span>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No pending event requests right now.</p>
            <p className="text-xs text-slate-600">New studio requests will appear here instantly.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-extrabold">EVENT NAME</th>
                  <th className="px-4 py-3 font-extrabold">STUDIO</th>
                  <th className="px-4 py-3 font-extrabold">DATE</th>
                  <th className="px-4 py-3 text-center font-extrabold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-4 font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      {req.name}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {req.client?.name || "Independent Studio"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-mono">
                      {new Date(req.eventDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href="/requests"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleAction(req.id, "REJECT")}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleAction(req.id, "ACCEPT")}
                          className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Accept
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
    </div>
  );
}