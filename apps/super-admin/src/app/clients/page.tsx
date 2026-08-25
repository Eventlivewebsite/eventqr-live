"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Loader2, Building, Mail, Phone } from "lucide-react";

interface StudioClient {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  storageLimitGB: number;
  storageUsedGB: number;
  totalEvents: number;
  activeEvents: number;
  isActive: boolean;
}

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<StudioClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    storageLimitGB: 50,
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        const res = await fetch("/api/clients", {
          cache: "no-store",
          headers: { "Accept": "application/json" },
        });

        const text = await res.text();
        if (!text) {
          if (!isCancelled) setClients([]);
          return;
        }

        const data = JSON.parse(text);
        if (data.success && !isCancelled) {
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error("Error loading clients:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [refreshKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok && data.success) {
        setShowModal(false);
        setFormData({ companyName: "", contactPerson: "", email: "", phone: "", storageLimitGB: 50 });
        setLoading(true);
        setRefreshKey((prev) => prev + 1);
      } else {
        alert(data.error || "Failed to create studio");
      }
    } catch {
      alert("Network error while creating studio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#030712] min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-pink-400 font-mono text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" /> Multi-Tenant Studio Fleet
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Studio Clients &amp; Quota Manager</h1>
          <p className="text-xs text-slate-400">Allocate cloud storage limits, monitor live event counts &amp; manage studios.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-pink-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Studio</span>
        </button>
      </div>

      {/* Studios Table */}
      <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
            <span className="text-xs">Loading studio clients...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Building className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">No studio clients registered yet.</p>
            <p className="text-xs text-slate-600">Click &ldquo;Onboard New Studio&rdquo; above to add your first client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-extrabold">STUDIO / COMPANY</th>
                  <th className="px-4 py-3 font-extrabold">CONTACT DETAILS</th>
                  <th className="px-4 py-3 font-extrabold">STORAGE ALLOCATION</th>
                  <th className="px-4 py-3 font-extrabold">EVENTS</th>
                  <th className="px-4 py-3 text-right font-extrabold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {clients.map((c) => {
                  const pct = Math.min(Math.round(((c.storageUsedGB || 0) / (c.storageLimitGB || 1)) * 100), 100);
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-4 py-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <Building className="w-4 h-4 text-pink-400" />
                          {c.companyName}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">Rep: {c.contactPerson}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400 space-y-0.5">
                        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-500" /> {c.email}</div>
                        {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> {c.phone}</div>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs font-mono text-slate-300 mb-1">
                          {c.storageUsedGB} GB / <span className="text-pink-400 font-bold">{c.storageLimitGB} GB</span> ({pct}%)
                        </div>
                        <div className="w-36 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono">
                        <span className="text-emerald-400 font-bold">{c.activeEvents} Live</span> / {c.totalEvents} Total
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Onboard New Studio */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080c14] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-white">Onboard New Studio Partner</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase">Studio / Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Royal Wedding Studios"
                  className="w-full mt-1 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase">Contact Person</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Lead Photographer / Owner"
                  className="w-full mt-1 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="studio@eventqr.live"
                  className="w-full mt-1 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase">Storage Quota (GB)</label>
                <input
                  type="number"
                  required
                  min="5"
                  value={formData.storageLimitGB}
                  onChange={(e) => setFormData({ ...formData, storageLimitGB: Number(e.target.value) })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Register Studio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}