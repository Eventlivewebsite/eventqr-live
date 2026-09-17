"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, Plus, Search, Edit2, Trash2, ShieldCheck, 
  X, Building, Mail, Lock, Sparkles, Loader2, Phone, 
  MapPin, HardDrive, UserCheck, RefreshCw
} from "lucide-react";

interface Client {
  id: string;
  companyName: string | null;
  contactPerson: string;
  email: string;
  phone: string;
  address: string | null;
  loginId: string | null;
  storageLimitGB: number;
  storageDays: number;
  plan: string;
  isActive: boolean;
  createdAt: string;
  _count?: { events: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [storageLimitGB, setStorageLimitGB] = useState("50");
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/clients", { 
        cache: "no-store",
        headers: { "Pragma": "no-cache" }
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && Array.isArray(data.clients)) {
        setClients(data.clients);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.error("Failed to load clients:", err);
      setClients([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.companyName?.toLowerCase().includes(query) ||
        c.contactPerson?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.loginId?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  // Open modal for creating new client
  const handleOpenCreateModal = () => {
    setEditingClientId(null);
    setCompanyName("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setAddress("");
    setLoginId("");
    setPassword("");
    setStorageLimitGB("50");
    setIsModalOpen(true);
  };

  // Open modal for editing existing client
  const handleOpenEditModal = (client: Client) => {
    setEditingClientId(client.id);
    setCompanyName(client.companyName || "");
    setContactPerson(client.contactPerson || "");
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setAddress(client.address || "");
    setLoginId(client.loginId || "");
    setPassword(""); // Leave blank for security unless updating
    setStorageLimitGB(String(client.storageLimitGB || 50));
    setIsModalOpen(true);
  };

  // Handle Form Submit (POST for create, PUT for update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEditing = Boolean(editingClientId);
      const method = isEditing ? "PUT" : "POST";

      const payload: Record<string, any> = {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        loginId: loginId.trim().toLowerCase(),
        storageLimitGB: Number(storageLimitGB) || 50,
      };

      if (isEditing) {
        payload.id = editingClientId;
        if (password.trim()) {
          payload.password = password.trim();
        }
      } else {
        payload.password = password.trim() || "studio123";
      }

      const res = await fetch("/api/clients", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setIsModalOpen(false);
        alert(isEditing ? "Studio updated successfully!" : "Studio Onboarded Successfully!");
        fetchClients();
      } else {
        const errorMsg = data?.message || `Server responded with status ${res.status}`;
        alert(`Error ${isEditing ? "updating" : "onboarding"} client: ` + errorMsg);
      }
    } catch (err: any) {
      alert("Network / API Error: " + (err?.message || "Connection refused"));
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Client
  const handleDelete = async (clientId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/clients?id=${clientId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      
      if (res.ok && data?.success) {
        alert("Studio deleted successfully!");
        fetchClients();
      } else {
        alert(data?.message || "Failed to delete studio");
      }
    } catch {
      alert("Error deleting client.");
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#030712] min-h-screen text-white">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 bg-[#0b0f19] border border-slate-800/80 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-pink-500" /> Client & Studio Management
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage studio vendors, quota limits, credentials, and access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchClients()}
            disabled={fetching}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700/60 transition cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin text-pink-500" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-600/30 transition cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b0f19] border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="relative w-full sm:w-96 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4" />
          <input
            type="text"
            placeholder="Search by studio, person, email, login ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition"
          />
        </div>

        <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Total Studios: <span className="text-white font-bold">{filteredClients.length}</span>
        </div>
      </div>

      {/* Clients Directory Table */}
      <div className="p-6 bg-[#0b0f19] border border-slate-800/80 rounded-3xl shadow-xl space-y-4">
        {fetching ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2 font-mono text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-pink-500" /> Loading directory...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm font-mono">
            No studios registered yet. Click &quot;Add New Client&quot; to onboard your first studio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">STUDIO / OWNER</th>
                  <th className="px-5 py-3.5">CONTACT & EMAIL</th>
                  <th className="px-5 py-3.5">LOGIN ID</th>
                  <th className="px-5 py-3.5">EVENTS</th>
                  <th className="px-5 py-3.5">STORAGE QUOTA</th>
                  <th className="px-5 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${c.isActive ? "bg-emerald-400" : "bg-slate-500"}`}></span>
                        {c.companyName || c.contactPerson || "Unnamed Studio"}
                      </div>
                      <div className="text-xs text-slate-400">{c.contactPerson}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white font-medium">{c.email}</div>
                      <div className="text-xs text-slate-400">{c.phone || "No phone"}</div>
                    </td>
                    <td className="px-5 py-4 text-pink-400 font-mono font-semibold">
                      {c.loginId || "N/A"}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-300">
                      {c._count?.events || 0}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-indigo-400 uppercase">{c.plan || "STANDARD"}</div>
                      <div className="text-xs text-slate-400">{c.storageLimitGB || 50} GB ({c.storageDays || 15} Days)</div>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {/* EDIT BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded-xl transition cursor-pointer"
                        title="Edit Studio Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.companyName || c.contactPerson)}
                        className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-xl transition cursor-pointer"
                        title="Delete Studio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-pink-600/20 text-pink-400 rounded-2xl border border-pink-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">
                  {editingClientId ? "Edit Studio Details" : "Onboard New Studio"}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">STUDIO / COMPANY NAME</label>
                <div className="relative flex items-center">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    type="text" required placeholder="e.g. Royal Wedding Studio" value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">CONTACT PERSON</label>
                <div className="relative flex items-center">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    type="text" required placeholder="e.g. Rahul Sharma" value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">EMAIL ADDRESS *</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      type="email" required placeholder="studio@gmail.com" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PHONE NUMBER</label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      type="text" placeholder="+91 9876543210" value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">STUDIO ADDRESS</label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    type="text" placeholder="e.g. Kolkata, West Bengal" value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">LOGIN ID (STUDIO USERNAME)</label>
                  <div className="relative flex items-center">
                    <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      type="text" placeholder="royal_studio" value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    PASSWORD {editingClientId && <span className="text-slate-500 font-normal lowercase">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      type="password" 
                      placeholder={editingClientId ? "•••••••• (unchanged)" : "••••••••"} 
                      value={password}
                      required={!editingClientId}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">STORAGE LIMIT (GB)</label>
                <div className="relative flex items-center">
                  <HardDrive className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    type="number" value={storageLimitGB}
                    onChange={(e) => setStorageLimitGB(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit" 
                  disabled={loading}
                  className="w-1/2 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingClientId ? (
                    "Update Studio"
                  ) : (
                    "Onboard Studio"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}