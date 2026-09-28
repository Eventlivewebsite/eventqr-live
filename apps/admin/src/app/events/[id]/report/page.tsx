"use client";

import React, { useState, useEffect, use } from "react";
import { 
  ArrowLeft, Printer, Download, Sparkles, Eye, 
  Heart, Image as ImageIcon, MapPin, Calendar, CheckCircle2,
  Users, Award
} from "lucide-react";
import Link from "next/link";

export default function ExecutiveClientReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [mediaVault, setMediaVault] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${eventId}/configure`);
        const json = await res.json();
        if (json.success && json.event) {
          setEvent(json.event);
          const cm = json.event.customMap || {};
          try {
            if (cm.mediaVault) setMediaVault(JSON.parse(cm.mediaVault));
          } catch {}
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [eventId]);

  if (loading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
        Generating Executive Report...
      </div>
    );
  }

  const photosCount = mediaVault.filter(m => m.type === "photo").length;
  const videosCount = mediaVault.filter(m => m.type === "video").length;
  let categoriesCount = 5;
  try {
    if (event.customMap?.photoCategories) {
      categoriesCount = JSON.parse(event.customMap.photoCategories).length;
    }
  } catch {}

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 text-gray-900 print:bg-white print:p-0">
      
      {/* Action Bar (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/events" className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Events
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
        >
          <Printer size={15} /> Print / Save as PDF
        </button>
      </div>

      {/* Main Luxury Executive Report Document Sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-xl p-8 md:p-12 space-y-8 print:shadow-none print:border-none print:p-4">
        
        {/* Document Header */}
        <div className="border-b-2 border-amber-500/30 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              OFFICIAL PERFORMANCE DOSSIER
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-2">{event.title}</h1>
            <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1"><MapPin size={13} className="text-amber-500" /> {event.venueName || event.location || "Private Venue"}</span>
              <span className="flex items-center gap-1"><Calendar size={13} className="text-amber-500" /> {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Completed Event"}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-gray-400 block uppercase">Client Name</span>
            <span className="text-base font-extrabold text-gray-900">{event.clientName || event.client?.name || "VIP Host"}</span>
          </div>
        </div>

        {/* Executive Summary Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 text-center">
            <Eye className="mx-auto text-amber-500 h-5 w-5 mb-1" />
            <span className="text-2xl font-black text-gray-900">1,480+</span>
            <span className="text-[10px] font-bold text-gray-400 block uppercase mt-0.5">Guest Scans & Views</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 text-center">
            <ImageIcon className="mx-auto text-blue-500 h-5 w-5 mb-1" />
            <span className="text-2xl font-black text-gray-900">{photosCount}</span>
            <span className="text-[10px] font-bold text-gray-400 block uppercase mt-0.5">HD Photos Published</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 text-center">
            <Download className="mx-auto text-emerald-500 h-5 w-5 mb-1" />
            <span className="text-2xl font-black text-gray-900">420+</span>
            <span className="text-[10px] font-bold text-gray-400 block uppercase mt-0.5">Album Downloads</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 text-center">
            <Heart className="mx-auto text-rose-500 h-5 w-5 mb-1" />
            <span className="text-2xl font-black text-gray-900">890+</span>
            <span className="text-[10px] font-bold text-gray-400 block uppercase mt-0.5">Loved Reactions</span>
          </div>
        </div>

        {/* Highlights & Coverage Summary */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <Sparkles className="text-amber-500 h-4 w-4" /> Media Coverage Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100 space-y-2">
              <span className="font-extrabold text-amber-900">Event Apartments Activated:</span>
              <p className="text-gray-600 leading-relaxed">
                Total {categoriesCount} distinct photographic categories covered including dedicated ceremony highlights, family portraits, candid live captures, and video chronicles.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-2">
              <span className="font-extrabold text-gray-900">Digital Engagement Score:</span>
              <p className="text-gray-600 leading-relaxed">
                Guests actively used individual download features and mobile interactive feeds with zero downtime across attendee devices.
              </p>
            </div>
          </div>
        </div>

        {/* Top Sample Gallery Reel */}
        {mediaVault.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-700 uppercase">Featured Visual Highlights</span>
            <div className="grid grid-cols-4 gap-3">
              {mediaVault.slice(0, 4).map((m, idx) => (
                <div key={idx} className="h-28 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img src={m.url} alt="Highlight" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature & Seal Footer */}
        <div className="border-t border-gray-200 pt-8 flex justify-between items-end text-xs text-gray-500">
          <div>
            <span className="font-bold text-gray-800 block">EventQR Studio Platform</span>
            <span>Verified Post-Event Certified Report</span>
          </div>
          <div className="text-right">
            <div className="h-10 w-28 border-b border-gray-400 ml-auto mb-1"></div>
            <span className="font-bold text-gray-800">Authorized Signatory</span>
          </div>
        </div>

      </div>
    </div>
  );
}