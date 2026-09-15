"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  QrCode,
  Download,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Search,
  Printer,
  Loader2,
  Calendar,
  Building,
  Radio,
} from "lucide-react";

interface QrItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  isLive: boolean;
  eventDate: string;
  clientName: string;
  targetUrl: string;
  qrCodeUrl: string;
}

export default function SuperAdminQrCodesPage() {
  const [events, setEvents] = useState<QrItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [printEvent, setPrintEvent] = useState<QrItem | null>(null);

  const fetchQrList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qr-codes", { credentials: "include" });
      const data = await res.json().catch(() => ({ success: false }));
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("[QR_FETCH_ERR]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQrList();
  }, [fetchQrList]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = async (qrUrl: string, eventName: string) => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${eventName.replace(/\s+/g, "_")}_EventQR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrUrl, "_blank");
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        ev.name.toLowerCase().includes(q) ||
        ev.slug.toLowerCase().includes(q) ||
        ev.clientName.toLowerCase().includes(q)
      );
    });
  }, [events, searchQuery]);

  return (
    <div className="p-8 space-y-6 bg-[#030712] min-h-screen text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-pink-400 font-mono text-xs uppercase tracking-wider">
            <QrCode className="w-4 h-4" /> Standee &amp; QR Management Suite
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Universal QR Distribution Hub
          </h1>
          <p className="text-xs text-slate-400">
            Generate, preview, export, and print guest upload QR standees for all studio events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event or studio..."
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none w-56 focus:border-pink-500 transition"
            />
          </div>

          <button
            type="button"
            onClick={fetchQrList}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-6 bg-[#080c14] border border-slate-800/80 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-bold text-white">Configured QR Gateways</h2>
            <span className="text-xs text-slate-500 font-mono">
              ({filteredEvents.length} active destinations)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            <span className="text-xs">Compiling QR configurations...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-20 text-center text-slate-500 space-y-3">
            <QrCode className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-sm font-bold text-slate-300">No event QR codes available</p>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Create an event from the studio dashboard to auto-generate high-res QR codes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-6 bg-slate-900/50 border border-slate-800/80 hover:border-pink-500/40 rounded-3xl transition space-y-5 flex flex-col justify-between"
              >
                {/* Event Info Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase">
                      {ev.type || "WEDDING"}
                    </span>
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        ev.isLive ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      <Radio className="w-2.5 h-2.5" />
                      {ev.isLive ? "LIVE" : "PENDING"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white truncate">{ev.name}</h3>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{ev.clientName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* QR Display Card */}
                <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-slate-200">
                  <img
                    src={ev.qrCodeUrl}
                    alt={ev.name}
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                  <span className="text-[10px] font-mono text-slate-500 font-bold mt-2">
                    Scan to Upload Photos
                  </span>
                </div>

                {/* Direct Link Info & Copy */}
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-pink-400 truncate max-w-[200px]">
                    /{ev.slug}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ev.targetUrl, ev.id)}
                    className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedId === ev.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDownloadQr(ev.qrCodeUrl, ev.name)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/60"
                  >
                    <Download className="w-3.5 h-3.5 text-pink-400" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintEvent(ev)}
                    className="py-2.5 px-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Standee</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Standee Print Modal */}
      {printEvent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#080c14] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                Event Standee Template
              </span>
              <button
                type="button"
                onClick={() => setPrintEvent(null)}
                className="text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Standee Card */}
            <div className="bg-gradient-to-b from-slate-900 to-black p-6 rounded-3xl border border-pink-500/30 shadow-2xl space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400">
                LIVE GUEST FEED
              </span>
              <h2 className="text-xl font-black text-white">{printEvent.name}</h2>
              <p className="text-xs text-slate-400">
                Capture the moment &amp; share your photos on the big screen!
              </p>

              <div className="bg-white p-4 rounded-2xl inline-block mx-auto shadow-xl">
                <img
                  src={printEvent.qrCodeUrl}
                  alt={printEvent.name}
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200">Point Camera &amp; Scan</p>
                <p className="text-[10px] font-mono text-slate-500">{printEvent.targetUrl}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Standee</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}