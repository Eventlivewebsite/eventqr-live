"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Image as ImageIcon,
  HardDrive,
  Plus,
  ArrowUpRight,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface ClientData {
  id: string;
  name?: string;
  companyName?: string;
  contactPerson?: string;
  email: string;
  loginId?: string;
  storageLimitGB?: number;
  allocatedStorageGb?: number;
  eventsCount?: number;
  _count?: { events: number };
  isActive?: boolean;
}

export default function SuperAdminDashboard() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && Array.isArray(data.clients)) {
        setClients(data.clients);
      } else if (Array.isArray(data)) {
        setClients(data);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.error("Dashboard failed to fetch clients:", err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete studio "${name}"?`)) return;

    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);

      if (res.ok && (data?.success || res.status === 200)) {
        setClients((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(data?.message || "Failed to delete client from database.");
      }
    } catch {
      alert("Network error occurred while deleting studio.");
    }
  };

  // Aggregations from real data
  const totalStorageGB = clients.reduce(
    (acc, curr) => acc + (curr.storageLimitGB || curr.allocatedStorageGb || 50),
    0
  );
  const totalEvents = clients.reduce(
    (acc, curr) => acc + (curr._count?.events || curr.eventsCount || 0),
    0
  );

  const studioPortalBaseUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      ? "https://eventqr-live-admin.vercel.app"
      : "http://localhost:3002");

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight">
              EventQR Live Admin
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time client management, gallery metrics, and QR activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchClients}
            disabled={loading}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition cursor-pointer"
            title="Refresh Client List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pink-500" : ""}`} />
          </button>

          <Link
            href="/clients"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-pink-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL CLIENTS
            </span>
            <p className="text-3xl font-black text-white">{clients.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              ACTIVE EVENTS
            </span>
            <p className="text-3xl font-black text-white">{totalEvents}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL MEDIA
            </span>
            <p className="text-3xl font-black text-white">0</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              STORAGE USAGE
            </span>
            <p className="text-3xl font-black text-white">{totalStorageGB} GB</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Clients Table with Actions (Edit, Delete, Open) */}
      <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Active Clients / Studios</h2>
            <p className="text-xs text-slate-400">
              Manage credentials, permissions, and allocated cloud storage
            </p>
          </div>
          <Link
            href="/clients"
            className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
            <span className="text-xs font-mono">Loading studio records...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            No studio accounts found in database. Click &quot;Add New Client&quot; to onboard.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800/60">
                <tr>
                  <th className="px-4 py-3">COMPANY / STUDIO</th>
                  <th className="px-4 py-3">EMAIL</th>
                  <th className="px-4 py-3">LOGIN ID</th>
                  <th className="px-4 py-3">EVENTS</th>
                  <th className="px-4 py-3">STORAGE</th>
                  <th className="px-4 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {clients.map((client) => {
                  const displayName = client.companyName || client.name || client.contactPerson || "Studio Partner";
                  return (
                    <tr key={client.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${client.isActive !== false ? "bg-emerald-400" : "bg-slate-500"}`}></div>
                        <span>{displayName}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">{client.email}</td>
                      <td className="px-4 py-3.5 font-mono text-pink-400 font-bold">
                        {client.loginId || "—"}
                      </td>
                      <td className="px-4 py-3.5">{client._count?.events ?? client.eventsCount ?? 0}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {client.storageLimitGB ?? client.allocatedStorageGb ?? 50} GB
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Client */}
                          <Link
                            href={`/clients/${client.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
                            title="Edit Client"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Open Studio Portal */}
                          <a
                            href={`${studioPortalBaseUrl}/dashboard`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition cursor-pointer border border-slate-700"
                            title="Open Studio Portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete Client */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClient(client.id, displayName)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Delete Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}