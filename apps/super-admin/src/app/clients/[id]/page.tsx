"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building, Mail, Phone, MapPin, UserCheck, 
  Lock, HardDrive, ArrowLeft, Loader2, Save 
} from "lucide-react";

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [storageLimitGB, setStorageLimitGB] = useState("50");

  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true);
        const res = await fetch("/api/clients", { cache: "no-store" });
        const data = await res.json().catch(() => null);

        if (res.ok && data?.clients) {
          const found = data.clients.find((c: any) => c.id === clientId);
          if (found) {
            setCompanyName(found.companyName || "");
            setContactPerson(found.contactPerson || "");
            setEmail(found.email || "");
            setPhone(found.phone || "");
            setAddress(found.address || "");
            setLoginId(found.loginId || "");
            setStorageLimitGB(String(found.storageLimitGB || 50));
          }
        }
      } catch (err) {
        console.error("Failed to fetch client details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        id: clientId,
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        loginId: loginId.trim().toLowerCase(),
        storageLimitGB: Number(storageLimitGB) || 50,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        alert("Studio updated successfully!");
        router.push("/clients");
      } else {
        alert(data?.message || "Failed to update studio.");
      }
    } catch (err: any) {
      alert("Error: " + (err?.message || "Check network"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center gap-3 text-slate-400 min-h-screen bg-[#030712]">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        <span className="text-sm font-mono">Loading studio profile...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-[#030712] min-h-screen text-white flex justify-center">
      <div className="w-full max-w-2xl bg-[#080c14] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <Link
              href="/clients"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
            </Link>
            <h1 className="text-2xl font-black text-white">Edit Studio Details</h1>
            <p className="text-xs text-slate-400">Update vendor storage limits, login credentials, and profile.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">STUDIO / COMPANY NAME</label>
            <div className="relative flex items-center">
              <Building className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">CONTACT PERSON</label>
            <div className="relative flex items-center">
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">EMAIL ADDRESS</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">PHONE NUMBER</label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">STUDIO ADDRESS</label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">LOGIN ID (USERNAME)</label>
              <div className="relative flex items-center">
                <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">
                NEW PASSWORD <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="password"
                  placeholder="•••••••• (unchanged)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">STORAGE LIMIT (GB)</label>
            <div className="relative flex items-center">
              <HardDrive className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="number"
                value={storageLimitGB}
                onChange={(e) => setStorageLimitGB(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Link
              href="/clients"
              className="w-1/2 py-2.5 text-center bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="w-1/2 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}