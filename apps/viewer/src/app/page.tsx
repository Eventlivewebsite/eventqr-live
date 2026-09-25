"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, MapPin, Lock, Unlock, Clock, Users, Utensils, Award } from "lucide-react";

export default function ViewerHomePage() {
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

 useEffect(() => {
    async function fetchEvent() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const querySlug = urlParams.get("event") || urlParams.get("slug");
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const pathSlug = pathParts[pathParts.length - 1];
        
        // Screenshot me ID 'cmugp2qbt000004l7t1ywppgc' ya slug 'testing-nns3'
        const activeSlug = querySlug || (pathSlug && pathSlug !== "e" ? pathSlug : null) || "cmugp2qbt000004l7t1ywppgc";

        const adminHost = "https://eventqr-live-admin.vercel.app";

        // First try production domain, fallback to current preview if needed
        let res = await fetch(`${adminHost}/api/public/event/${encodeURIComponent(activeSlug)}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          res = await fetch(`https://eventqr-live-admin-2mc76o3hm-new-4aa5.vercel.app/api/public/event/${encodeURIComponent(activeSlug)}`, {
            cache: "no-store",
          });
        }

        const data = await res.json().catch(() => null);

        if (res.ok && data?.success && data?.event) {
          setEventData(data.event);
          if (data.event.accessMode === "PUBLIC") {
            setIsUnlocked(true);
          }
        }
      } catch (err) {
        console.error("Viewer fetch error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <Sparkles className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold">Event not found or inactive.</h1>
      </div>
    );
  }

  // --- DATE GATE CHECK ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDateParsed = eventData.eventDate ? new Date(eventData.eventDate) : new Date();
  eventDateParsed.setHours(0, 0, 0, 0);

  const isFutureEvent = eventDateParsed > today;

  if (isFutureEvent) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-full">
          <Clock className="w-10 h-10 text-pink-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-black">{eventData.title}</h1>
        <p className="text-slate-400 text-sm">This event is scheduled to go live on:</p>
        <span className="text-xl font-mono font-bold text-pink-400 bg-pink-500/10 px-4 py-2 rounded-xl border border-pink-500/20">
          {eventDateParsed.toLocaleDateString()}
        </span>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          The gallery, family profiles, food menus, and live feeds will automatically unlock on the scheduled date.
        </p>
      </div>
    );
  }

  // --- PRIVATE PIN GATE CHECK ---
  if (eventData.accessMode === "PRIVATE" && !isUnlocked) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md p-8 bg-[#080c14] border border-slate-800 rounded-3xl space-y-6 text-center shadow-2xl">
          <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{eventData.title}</h1>
            <p className="text-xs text-slate-400 mt-1">This event is private. Enter 4-digit PIN to access.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pinInput.trim() === String(eventData.pinCode || "")) {
                setIsUnlocked(true);
                setErrorMsg("");
              } else {
                setErrorMsg("Incorrect PIN code. Please try again.");
              }
            }}
            className="space-y-4"
          >
            <input
              type="password"
              maxLength={6}
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full bg-[#030712] border border-slate-800 rounded-xl px-4 py-3 text-center text-lg tracking-widest text-white outline-none focus:border-amber-500 font-mono"
            />
            {errorMsg && <p className="text-xs text-rose-400 font-bold">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Unlock Event
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- UNLOCKED DYNAMIC VIEWER FEED ---
  const familyList = Array.isArray(eventData.familyMembers) ? eventData.familyMembers : [];
  const foodList = Array.isArray(eventData.foodItems) ? eventData.foodItems : [];
  const vegItems = foodList.filter((f: any) => f.category === "VEG");
  const nonVegItems = foodList.filter((f: any) => f.category === "NON_VEG");

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-8 max-w-4xl mx-auto font-sans">
      {/* Hero Header */}
      <div className="p-8 bg-gradient-to-br from-[#080c14] to-[#030712] border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl relative overflow-hidden">
        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase tracking-widest">
          {eventData.heroTag || "LIVE CELEBRATION"}
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{eventData.title}</h1>
        <p className="text-sm text-slate-400 font-medium">{eventData.subtitle}</p>
        <div className="flex flex-wrap justify-center items-center gap-4 pt-2 text-xs text-slate-300 font-mono">
          <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-pink-400" /> {new Date(eventData.eventDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-pink-400" /> {eventData.venueName}
          </span>
        </div>
      </div>

      {/* Family Profiles Section */}
      {familyList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" /> Family Profiles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {familyList.map((m: any, i: number) => (
              <div key={i} className="p-4 bg-[#080c14] border border-slate-800 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">PHOTO</div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{m.name}</h3>
                  <p className="text-xs text-pink-400 font-medium">{m.role}</p>
                  {m.bio && <p className="text-[11px] text-slate-400 mt-1">{m.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food & Drinks Menu Section (Categorized Veg & Non-Veg) */}
      {foodList.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-400" /> Food & Drinks Menu
          </h2>

          {vegItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <span>🌱 Pure Veg Delicacies</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vegItems.map((f: any, i: number) => (
                  <div key={i} className="p-3.5 bg-[#080c14] border border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                      {f.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">DISH</div>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">{f.name}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block mt-1">
                        VEG
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nonVegItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                <span>🍗 Non-Veg Specialties</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nonVegItems.map((f: any, i: number) => (
                  <div key={i} className="p-3.5 bg-[#080c14] border border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                      {f.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">DISH</div>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">{f.name}</span>
                      <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 inline-block mt-1">
                        NON-VEG
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}