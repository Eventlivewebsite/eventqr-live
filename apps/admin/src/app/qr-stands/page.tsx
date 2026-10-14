"use client";

import React, { useEffect, useState, useRef } from "react";
import { QrCode, Download, Share2, Copy, Check, ExternalLink, Sparkles, Printer, Calendar } from "lucide-react";

export default function QRStandsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await fetch("/api/events");
        const data = await res.json();
        const list = data.events || [];
        setEvents(list);
        if (list.length > 0) {
          setSelectedEvent(list[0]);
        }
      } catch (err) {
        console.error("Failed to fetch events for QR stands:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const viewerUrl = selectedEvent
    ? `${typeof window !== "undefined" ? window.location.origin.replace(":3002", ":3000") : ""}/event/${selectedEvent.slug || selectedEvent.id}`
    : "";

  // Render QR Code onto canvas using Google Chart API fallback to native canvas
  useEffect(() => {
    if (!viewerUrl || !qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(viewerUrl)}&bgcolor=ffffff&color=000000&margin=2`;

    qrImg.onload = () => {
      canvas.width = 500;
      canvas.height = 500;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 500, 500);
      ctx.drawImage(qrImg, 0, 0, 500, 500);
    };
  }, [viewerUrl, selectedEvent]);

  const handleCopyLink = () => {
    if (!viewerUrl) return;
    navigator.clipboard.writeText(viewerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current || !selectedEvent) return;
    const link = document.createElement("a");
    link.download = `${selectedEvent.title || "event"}-qr-standee.png`;
    link.href = qrCanvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <QrCode className="w-8 h-8 text-pink-500" /> QR Standees & Guest Sharing
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Generate high-resolution printable table standees and shareable guest portal links.
          </p>
        </div>

        {events.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Active Event:</span>
            <select
              value={selectedEvent?.id || ""}
              onChange={(e) => {
                const found = events.find((ev) => ev.id === e.target.value);
                if (found) setSelectedEvent(found);
              }}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-pink-500 cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title || ev.name} ({ev.slug || "LIVE"})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading event QR assets...</span>
        </div>
      ) : !selectedEvent ? (
        <div className="border border-dashed border-slate-800 rounded-3xl p-16 text-center space-y-2">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">No Approved Events Available</h3>
          <p className="text-xs text-slate-500">Create and approve an event first to generate table standees.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Printable Standee Card (Left Preview) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0e1424] to-[#070b14] border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden print:p-0 print:border-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <span className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full text-[10px] font-black uppercase tracking-wider mb-4">
              Table Standee Display
            </span>

            <h2 className="text-2xl font-black text-white tracking-tight">
              {selectedEvent.title || selectedEvent.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              Scan to view and upload live celebration memories
            </p>

            {/* QR Card Container */}
            <div className="p-4 bg-white rounded-2xl shadow-xl shadow-black/60 border-4 border-slate-100 flex items-center justify-center">
              <canvas ref={qrCanvasRef} className="w-56 h-56 rounded-lg" />
            </div>

            <div className="mt-6 space-y-1">
              <p className="text-xs font-bold text-slate-300">Point phone camera to scan</p>
              <p className="text-[11px] text-pink-400 font-mono font-medium">No App Download Required</p>
            </div>
          </div>

          {/* Quick Actions & Sharing Controls (Right Side) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Direct Link Share Card */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-pink-500" /> Guest Portal Live Link
              </h3>
              <p className="text-xs text-slate-400">
                Share this direct URL with event hosts, wedding coordinators, or via WhatsApp group invites.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  readOnly
                  value={viewerUrl}
                  className="flex-1 bg-black/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  type="button"
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy Link"}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Access live photos & uploads: " + viewerUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  Share via WhatsApp
                </a>
                <a
                  href={viewerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Preview Viewer
                </a>
              </div>
            </div>

            {/* Standee Export Actions */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-pink-500" /> Standee Print & Export Options
              </h3>
              <p className="text-xs text-slate-400">
                Download high-resolution graphic assets ready for acrylic table stands, welcome boards, or LED screen displays.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="p-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Standee PNG (500x500)
                </button>

                <button
                  type="button"
                  onClick={handlePrintStandee}
                  className="p-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Standee Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
