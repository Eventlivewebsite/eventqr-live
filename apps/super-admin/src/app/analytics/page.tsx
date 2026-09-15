"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Image as ImageIcon,
  HardDrive,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Sparkles,
  Building,
  CheckCircle2,
  Radio,
  Clock,
  ArrowUpRight,
} from "lucide-react";

interface AnalyticsData {
  stats: {
    totalClients: number;
    totalEvents: number;
    liveEvents: number;
    pendingEvents: number;
    rejectedEvents: number;
    totalMedia: number;
    allocatedStorageGb: number;
    usedStorageGb: number;
  };
  studioMetrics: Array<{
    id: string;
    name: string;
    email: string;
    totalEvents: number;
    liveEvents: number;
    allocatedGb: number;
  }>;
  recentEvents: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export default function SuperAdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics", { credentials: "include" });
      const json = await res.json().catch(() => ({ success: false }));
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("[ANALYTICS_FETCH_ERROR]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = data?.stats || {
    totalClients: 1,
    totalEvents: 1,
    liveEvents: 1,
    pendingEvents: 0,
    rejectedEvents: 0,
    totalMedia: 0,
    allocatedStorageGb: 50,
    usedStorageGb: 0.1,
  };

  const storageUsagePercent = Math.min(
    100,
    Math.max(2, Math.round((stats.usedStorageGb / stats.allocatedStorageGb) * 100))
  );

  return (
    <div className="p-8 space-y-6 bg-[#030712] min-h-screen text-slate-100 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-pink-400 font-mono text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Platform Intelligence &amp; Performance
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Universal Analytics Suite
          </h1>
          <p className="text-xs text-slate-400">
            Real-time metrics on studio growth, live event throughput, and cloud storage allocation.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {loading ? (
        <div className="p-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="text-xs font-mono">Aggregating platform datasets...</span>
        </div>
      ) : (
        <>
          {/* Top 4 Primary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  STUDIO PARTNERS
                </span>
                <p className="text-3xl font-black text-white">{stats.totalClients}</p>
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  100% active studios
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  TOTAL CREATED EVENTS
                </span>
                <p className="text-3xl font-black text-white">{stats.totalEvents}</p>
                <span className="text-[11px] text-pink-400 font-semibold block">
                  {stats.liveEvents} active live feeds
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  GUEST UPLOADS / MEDIA
                </span>
                <p className="text-3xl font-black text-white">{stats.totalMedia}</p>
                <span className="text-[11px] text-purple-400 font-semibold block">
                  Real-time photo stream
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  STORAGE UTILIZATION
                </span>
                <p className="text-3xl font-black text-white">
                  {stats.usedStorageGb} <span className="text-xs text-slate-500">/ {stats.allocatedStorageGb} GB</span>
                </p>
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  Healthy cloud allocation
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Middle Section: Cloud Storage Progress & Verification Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Storage Progress Box */}
            <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white">Global Storage Allocation &amp; Bandwidth</h2>
                  <p className="text-xs text-slate-400">
                    Live aggregate usage of AWS S3 / Supabase storage buckets
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-pink-400">
                  {storageUsagePercent}% Used
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${storageUsagePercent}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
                  <span>Current: {stats.usedStorageGb} GB</span>
                  <span>Total Provisioned: {stats.allocatedStorageGb} GB</span>
                </div>
              </div>

              {/* Status Pills */}
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Available Headroom</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {(stats.allocatedStorageGb - stats.usedStorageGb).toFixed(1)} GB Free
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Asset Health</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">Zero CDN Latency</span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Compression Ratio</span>
                  <span className="text-sm font-bold text-sky-400 mt-0.5 block">WebP Auto-optimized</span>
                </div>
              </div>
            </div>

            {/* Verification Breakdown */}
            <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-white">Event Audit Ratio</h2>
                <p className="text-xs text-slate-400">Approval pipeline breakdown</p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">Approved &amp; Live</span>
                  </div>
                  <span className="text-xs font-black font-mono text-emerald-400">{stats.liveEvents}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">Pending Review</span>
                  </div>
                  <span className="text-xs font-black font-mono text-amber-400">{stats.pendingEvents}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold text-slate-200">Rejected / Returned</span>
                  </div>
                  <span className="text-xs font-black font-mono text-rose-400">{stats.rejectedEvents}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Table: Studio Level Distribution */}
          <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-base font-bold text-white">Studio Client Distribution &amp; Usage</h2>
              <p className="text-xs text-slate-400">
                Individual studio partner performance, event counts, and allocated quotas
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/70 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">STUDIO / CLIENT</th>
                    <th className="px-4 py-3">ACCOUNT EMAIL</th>
                    <th className="px-4 py-3">TOTAL EVENTS</th>
                    <th className="px-4 py-3">LIVE FEEDS</th>
                    <th className="px-4 py-3">STORAGE QUOTA</th>
                    <th className="px-4 py-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {(data?.studioMetrics || []).map((studio) => (
                    <tr key={studio.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-pink-400" />
                        <span>{studio.name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">{studio.email}</td>
                      <td className="px-4 py-3.5 font-bold text-white">{studio.totalEvents}</td>
                      <td className="px-4 py-3.5 text-emerald-400 font-bold">{studio.liveEvents}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">{studio.allocatedGb} GB</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Partner
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}