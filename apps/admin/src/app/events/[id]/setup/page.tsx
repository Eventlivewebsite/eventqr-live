"use client";

import React, { useState, useEffect, use } from "react";
import { 
  ArrowLeft, CheckCircle2, Loader2, Sparkles, MapPin, 
  Image as ImageIcon, Utensils, Users, Clock, Film, 
  Music, Upload, Trash2, Calendar, Eye, Heart
} from "lucide-react";
import Link from "next/link";

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export default function EventSetupPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [slug, setSlug] = useState("");

  // Event Type Preset
  const [eventType, setEventType] = useState<"WEDDING" | "CORPORATE" | "BIRTHDAY" | "GENERAL">("WEDDING");

  // 1. Basic Information
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [venueName, setVenueName] = useState("");
  const [heroTag, setHeroTag] = useState("LIVE EVENT");
  const [scheduledPublishDate, setScheduledPublishDate] = useState("");

  // 2. Hero Highlights, Countdown & Buttons
  const [highlightType, setHighlightType] = useState<"video" | "photos">("video");
  const [highlightVideoUrl, setHighlightVideoUrl] = useState("");
  const [highlightPhotos, setHighlightPhotos] = useState<string[]>([]);
  const [ourStoryUrl, setOurStoryUrl] = useState("");
  const [ceremonyName, setCeremonyName] = useState("Wedding Reception");
  const [countdownTarget, setCountdownTarget] = useState("");

  // 3. Photo & Video Categories
  const [photoCategories, setPhotoCategories] = useState<string[]>(["Ceremony", "Haldi", "Mehendi", "Reception", "Family", "Party"]);
  const [videoCategories, setVideoCategories] = useState<string[]>(["Highlights", "Ceremony", "Haldi", "Reception"]);
  const [newPhotoCat, setNewPhotoCat] = useState("");
  const [newVideoCat, setNewVideoCat] = useState("");

  // 4. Decoration Section (Drawer Items)
  const [showDecoration, setShowDecoration] = useState(true);
  const [decorationItems, setDecorationItems] = useState<string[]>([
    "Wedding Stage", "Floral Decoration", "Lighting", "Entrance", "Dining", "Selfie Booth", "Reception Hall"
  ]);
  const [newDecorItem, setNewDecorItem] = useState("");

  // 5. Timelines & Program Schedule
  const [showTimeline, setShowTimeline] = useState(true);
  const [timelines, setTimelines] = useState<any[]>([
    { id: 1, title: "Wedding Reception", timeText: "06:00 PM", statusText: "LIVE" },
    { id: 2, title: "Dinner", timeText: "08:00 PM", statusText: "UPCOMING" },
    { id: 3, title: "Haldi Ceremony", timeText: "11:00 AM", statusText: "COMPLETED" },
  ]);
  const [progTitle, setProgTitle] = useState("");
  const [progTime, setProgTime] = useState("");
  const [progStatus, setProgStatus] = useState("UPCOMING");

  // 6. Food & Drinks Menu (Veg, Non-Veg, Drink)
  const [showFoodMenu, setShowFoodMenu] = useState(true);
  const [foodItems, setFoodItems] = useState<any[]>([
    { id: 1, name: "Paneer Tikka Royale", category: "VEG", description: "Charcoal grilled cottage cheese with aromatic spices", photoUrl: "" },
    { id: 2, name: "Royal Blue Lagoon", category: "DRINK", description: "Refreshing blue curaçao mocktail with citrus notes", photoUrl: "" }
  ]);
  const [dishName, setDishName] = useState("");
  const [dishCat, setDishCat] = useState<"VEG" | "NON_VEG" | "DRINK">("VEG");
  const [dishDesc, setDishDesc] = useState("");
  const [dishPhoto, setDishPhoto] = useState("");

  // 7. Family Members / VIPs (Single Luxury Card with Socials)
  const [showFamily, setShowFamily] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<any[]>([
    { id: 1, name: "Rajesh Sharma", relation: "Father of the Bride", photoUrl: "", instagramUrl: "", facebookUrl: "" }
  ]);
  const [memName, setMemName] = useState("");
  const [memRelation, setMemRelation] = useState("");
  const [memPhoto, setMemPhoto] = useState("");
  const [memInsta, setMemInsta] = useState("");
  const [memFb, setMemFb] = useState("");

  // 8. Playlist
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [playlist, setPlaylist] = useState<any[]>([]);

  // Apply Presets
  const applyPreset = (type: "WEDDING" | "CORPORATE" | "BIRTHDAY") => {
    setEventType(type);
    if (type === "WEDDING") {
      setSubtitle("Forever Begins Today");
      setCeremonyName("Wedding Reception");
      setPhotoCategories(["Ceremony", "Haldi", "Mehendi", "Reception", "Family", "Party"]);
      setDecorationItems(["Wedding Stage", "Floral Decoration", "Lighting", "Entrance", "Dining", "Selfie Booth", "Reception Hall"]);
    } else if (type === "CORPORATE") {
      setSubtitle("Annual Tech & Leadership Summit 2027");
      setCeremonyName("Keynote Presentation");
      setPhotoCategories(["Keynote", "Workshops", "Panel Discussion", "Networking", "Awards", "Exhibition"]);
      setDecorationItems(["Main Stage", "Entrance Arch", "Expo Booths", "VIP Lounge", "Dining Area"]);
    } else if (type === "BIRTHDAY") {
      setSubtitle("Cheers to 25 Wonderful Years!");
      setCeremonyName("Grand Cake Cutting");
      setPhotoCategories(["Arrivals", "Cake Cutting", "Dance & Music", "Party Moments", "Friends & Family"]);
      setDecorationItems(["Theme Backdrop", "Balloon Setup", "Photo Booth", "Dining Setup", "Candy Bar"]);
    }
  };

  useEffect(() => {
    async function loadEventData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${eventId}/configure`);
        const json = await res.json();
        if (json.success && json.event) {
          const ev = json.event;
          setSlug(ev.slug || "");
          setTitle(ev.title || "");
          setVenueName(ev.venueName || ev.location || "");
          setHeroTag(ev.heroTag || "LIVE EVENT");

          const cm = ev.customMap || {};
          if (cm.subtitle) setSubtitle(cm.subtitle);
          if (cm.eventType) setEventType(cm.eventType as any);
          if (cm.scheduledPublishDate) setScheduledPublishDate(cm.scheduledPublishDate);
          if (cm.highlightType) setHighlightType(cm.highlightType as any);
          if (cm.highlightVideoUrl) setHighlightVideoUrl(cm.highlightVideoUrl);
          if (cm.ourStoryUrl) setOurStoryUrl(cm.ourStoryUrl);
          if (cm.ceremonyName) setCeremonyName(cm.ceremonyName);

          try { if (cm.highlightPhotos) setHighlightPhotos(JSON.parse(cm.highlightPhotos)); } catch {}
          try { if (cm.photoCategories) setPhotoCategories(JSON.parse(cm.photoCategories)); } catch {}
          try { if (cm.videoCategories) setVideoCategories(JSON.parse(cm.videoCategories)); } catch {}
          try { if (cm.decorationItems) setDecorationItems(JSON.parse(cm.decorationItems)); } catch {}
          try { if (cm.timelines) setTimelines(JSON.parse(cm.timelines)); } catch {}
          try { if (cm.foodItems) setFoodItems(JSON.parse(cm.foodItems)); } catch {}
          try { if (cm.familyMembers) setFamilyMembers(JSON.parse(cm.familyMembers)); } catch {}
          try { if (cm.playlist) setPlaylist(JSON.parse(cm.playlist)); } catch {}

          if (cm.showDecoration !== undefined) setShowDecoration(cm.showDecoration === "true");
          if (cm.showTimeline !== undefined) setShowTimeline(cm.showTimeline === "true");
          if (cm.showFoodMenu !== undefined) setShowFoodMenu(cm.showFoodMenu === "true");
          if (cm.showFamily !== undefined) setShowFamily(cm.showFamily === "true");
          if (cm.showPlaylist !== undefined) setShowPlaylist(cm.showPlaylist === "true");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEventData();
  }, [eventId]);

  const handleFileUpload = async (file: File, category: string, cb: (url: string) => void) => {
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("eventId", eventId);
      fd.append("category", category);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success && json.url) {
        cb(json.url);
      } else {
        alert("Upload error: " + json.error);
      }
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePublishAll = async () => {
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        title,
        venueName,
        heroTag,
        subtitle,
        eventType,
        scheduledPublishDate,
        highlightType,
        highlightVideoUrl,
        highlightPhotos,
        ourStoryUrl,
        ceremonyName,
        photoCategories,
        videoCategories,
        showDecoration,
        decorationItems,
        showTimeline,
        timelines,
        showFoodMenu,
        foodItems,
        showFamily,
        familyMembers,
        showPlaylist,
        playlist,
      };

      const res = await fetch(`/api/events/${eventId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Everything saved and published directly to Viewer!");
        setTimeout(() => setMsg(""), 5000);
      } else {
        setMsg("Save error: " + data.error);
      }
    } catch (e: any) {
      setMsg("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Master Top Header */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/events" className="text-xs font-semibold text-gray-500 flex items-center gap-1 hover:underline mb-2">
              <ArrowLeft size={14} /> Back to Events
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-amber-500" /> Event Master Control & Live Customizer
            </h1>
            <p className="text-xs text-gray-500">Live customization engine for {title || "Event"}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {slug && (
              <a
                href={`http://localhost:3000/?event=${slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold px-4 py-2.5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition shadow-sm"
              >
                Open Live Viewer ↗
              </a>
            )}
            <button
              onClick={handlePublishAll}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-2xl font-bold shadow-md hover:opacity-95 disabled:opacity-50 transition"
            >
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              Publish to Live Viewer
            </button>
          </div>
        </div>

        {msg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-sm">
            {msg}
          </div>
        )}

        {/* Preset Selector */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
            ⚡ Quick Setup Template:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset("WEDDING")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${eventType === "WEDDING" ? "bg-amber-600 text-white shadow" : "bg-white text-gray-700 border"}`}
            >
              💍 Wedding Celebration
            </button>
            <button
              type="button"
              onClick={() => applyPreset("CORPORATE")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${eventType === "CORPORATE" ? "bg-amber-600 text-white shadow" : "bg-white text-gray-700 border"}`}
            >
              🏢 Corporate Summit
            </button>
            <button
              type="button"
              onClick={() => applyPreset("BIRTHDAY")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${eventType === "BIRTHDAY" ? "bg-amber-600 text-white shadow" : "bg-white text-gray-700 border"}`}
            >
              🎂 Birthday & Party
            </button>
          </div>
        </div>

        {/* 1. Basic Metadata & Heading */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <MapPin className="text-amber-500 h-5 w-5" /> 1. Event Headings, Venue & Publish Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. A & S Wedding / Tech Con 2027"
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="e.g. Forever Begins Today"
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Venue / Location</label>
              <input
                type="text"
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                placeholder="e.g. Jaipur Palace, Rajasthan"
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Publish Date (Scheduled)</label>
              <input
                type="date"
                value={scheduledPublishDate}
                onChange={e => setScheduledPublishDate(e.target.value)}
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Hero Highlights & Countdown Card */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Film className="text-amber-500 h-5 w-5" /> 2. Hero Banner, Countdown & Actions
            </h2>
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setHighlightType("video")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${highlightType === "video" ? "bg-white text-gray-900 shadow" : "text-gray-500"}`}
              >
                Highlight Video
              </button>
              <button
                type="button"
                onClick={() => setHighlightType("photos")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${highlightType === "photos" ? "bg-white text-gray-900 shadow" : "text-gray-500"}`}
              >
                Slideshow Photos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Ceremony / Stage Name (In Countdown Card)</label>
              <input
                type="text"
                value={ceremonyName}
                onChange={e => setCeremonyName(e.target.value)}
                placeholder="e.g. Wedding Reception / Keynote"
                className="mt-1 w-full border rounded-xl p-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Our Story / About Link</label>
              <input
                type="text"
                value={ourStoryUrl}
                onChange={e => setOurStoryUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full border rounded-xl p-2.5 text-sm outline-none"
              />
            </div>
          </div>

          {highlightType === "video" ? (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-600 uppercase">Continuous Highlight Video Link (.mp4 or stream)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={highlightVideoUrl}
                  onChange={e => setHighlightVideoUrl(e.target.value)}
                  placeholder="https://...mp4"
                  className="flex-1 border rounded-xl p-2.5 text-sm outline-none"
                />
                <label className="cursor-pointer bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Upload size={14} /> Upload Video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], "highlight_video", url => setHighlightVideoUrl(url));
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-600 uppercase">Hero Slideshow Photos ({highlightPhotos.length})</label>
                <label className="cursor-pointer bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Upload size={13} /> Add Slide Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], "hero_slideshow", url => setHighlightPhotos([...highlightPhotos, url]));
                      }
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {highlightPhotos.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border h-20 bg-gray-100">
                    <img src={url} alt="Slide" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setHighlightPhotos(highlightPhotos.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Photo & Video Categories */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <ImageIcon className="text-amber-500 h-5 w-5" /> 3. Gallery Category Filters
          </h2>
          <div>
            <span className="text-xs font-bold text-gray-600 uppercase">Categories Displayed in Viewer</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {photoCategories.map((c, i) => (
                <span key={i} className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  {c}
                  <button type="button" onClick={() => setPhotoCategories(photoCategories.filter((_, idx) => idx !== i))} className="hover:text-red-500 font-bold">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-3 max-w-md">
              <input
                type="text"
                value={newPhotoCat}
                onChange={e => setNewPhotoCat(e.target.value)}
                placeholder="Add new category tag..."
                className="border rounded-xl p-2.5 text-xs outline-none flex-1"
              />
              <button
                type="button"
                onClick={() => { if (newPhotoCat.trim()) { setPhotoCategories([...photoCategories, newPhotoCat.trim()]); setNewPhotoCat(""); } }}
                className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-700"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* 4. Decoration Section (Drawer Items) */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-rose-500 h-5 w-5" /> 4. Decoration Drawer Albums
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showDecoration}
                onChange={e => setShowDecoration(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              Decoration Section ON
            </label>
          </div>

          {showDecoration && (
            <div>
              <span className="text-xs font-bold text-gray-600 uppercase">Active Decoration Albums</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {decorationItems.map((item, i) => (
                  <span key={i} className="bg-rose-50 border border-rose-200 text-rose-900 px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    🌸 {item}
                    <button type="button" onClick={() => setDecorationItems(decorationItems.filter((_, idx) => idx !== i))} className="hover:text-red-500 font-bold">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-3 max-w-md">
                <input
                  type="text"
                  value={newDecorItem}
                  onChange={e => setNewDecorItem(e.target.value)}
                  placeholder="e.g. VIP Stage / Stage Lighting"
                  className="border rounded-xl p-2.5 text-xs outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={() => { if (newDecorItem.trim()) { setDecorationItems([...decorationItems, newDecorItem.trim()]); setNewDecorItem(""); } }}
                  className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-700"
                >
                  + Add Album
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Schedule & Timings */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-amber-500 h-5 w-5" /> 5. Program Schedule & Live Status
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showTimeline}
                onChange={e => setShowTimeline(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              Schedule Section ON
            </label>
          </div>

          {showTimeline && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <input
                  type="text"
                  placeholder="Program (e.g. Ring Ceremony)"
                  value={progTitle}
                  onChange={e => setProgTitle(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Time (e.g. 07:00 PM)"
                  value={progTime}
                  onChange={e => setProgTime(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <select
                  value={progStatus}
                  onChange={e => setProgStatus(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white font-bold outline-none"
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="LIVE">🔴 LIVE NOW</option>
                  <option value="COMPLETED">🟢 COMPLETED</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (progTitle.trim()) {
                      setTimelines([...timelines, { id: Date.now(), title: progTitle.trim(), timeText: progTime.trim() || "TBD", statusText: progStatus }]);
                      setProgTitle("");
                      setProgTime("");
                    }
                  }}
                  className="bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-2">
                {timelines.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3.5 border rounded-2xl bg-gray-50 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${t.statusText === "LIVE" ? "bg-red-500 text-white animate-pulse" : t.statusText === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {t.statusText}
                      </span>
                      <span className="font-bold text-gray-900">{t.title}</span>
                      <span className="text-gray-500">({t.timeText})</span>
                    </div>
                    <button type="button" onClick={() => setTimelines(timelines.filter(x => x.id !== t.id))} className="text-red-500 font-bold hover:underline">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6. Food & Drinks Menu (Veg, Non-Veg, Drink) */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Utensils className="text-amber-500 h-5 w-5" /> 6. Food & Drinks Feast
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showFoodMenu}
                onChange={e => setShowFoodMenu(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              Food Section ON
            </label>
          </div>

          {showFoodMenu && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <input
                  type="text"
                  placeholder="Dish / Drink Name"
                  value={dishName}
                  onChange={e => setDishName(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <select
                  value={dishCat}
                  onChange={e => setDishCat(e.target.value as any)}
                  className="border rounded-xl p-2.5 text-xs bg-white font-bold outline-none"
                >
                  <option value="VEG">🌱 Veg Dish</option>
                  <option value="NON_VEG">🍗 Non-Veg</option>
                  <option value="DRINK">🍹 Beverage / Drink</option>
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={dishDesc}
                  onChange={e => setDishDesc(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <label className="cursor-pointer bg-white border text-gray-700 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50">
                  <Upload size={14} /> {dishPhoto ? "Photo Ready" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], "dishes", url => setDishPhoto(url));
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (dishName.trim()) {
                      setFoodItems([...foodItems, { id: Date.now(), name: dishName.trim(), category: dishCat, description: dishDesc.trim() || "Prepared with love", photoUrl: dishPhoto }]);
                      setDishName("");
                      setDishDesc("");
                      setDishPhoto("");
                    }
                  }}
                  className="bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-2">
                {foodItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3.5 border rounded-2xl bg-gray-50 text-xs">
                    <div className="flex items-center gap-3">
                      {item.photoUrl && <img src={item.photoUrl} alt={item.name} className="h-9 w-9 rounded-xl object-cover" />}
                      <span className="font-bold text-gray-900">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.category === "VEG" ? "bg-emerald-100 text-emerald-800" : item.category === "NON_VEG" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"}`}>
                        {item.category}
                      </span>
                      <span className="text-gray-500 truncate max-w-xs">{item.description}</span>
                    </div>
                    <button type="button" onClick={() => setFoodItems(foodItems.filter(x => x.id !== item.id))} className="text-red-500 font-bold hover:underline">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. Family / VIPs (Single Luxury Card with Social Profiles) */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-amber-500 h-5 w-5" /> 7. Family Members & Key People
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showFamily}
                onChange={e => setShowFamily(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              Family Section ON
            </label>
          </div>

          {showFamily && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-rose-50/40 p-4 rounded-2xl border border-rose-200">
                <input
                  type="text"
                  placeholder="Member Name"
                  value={memName}
                  onChange={e => setMemName(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Relation (e.g. Groom's Brother)"
                  value={memRelation}
                  onChange={e => setMemRelation(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Instagram Link"
                  value={memInsta}
                  onChange={e => setMemInsta(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Facebook Link"
                  value={memFb}
                  onChange={e => setMemFb(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <label className="cursor-pointer bg-white border text-gray-700 px-2 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50">
                  <Upload size={14} /> {memPhoto ? "Photo Set" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], "family", url => setMemPhoto(url));
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (memName.trim()) {
                      setFamilyMembers([...familyMembers, { id: Date.now(), name: memName.trim(), relation: memRelation.trim() || "Family", photoUrl: memPhoto, instagramUrl: memInsta.trim(), facebookUrl: memFb.trim() }]);
                      setMemName("");
                      setMemRelation("");
                      setMemPhoto("");
                      setMemInsta("");
                      setMemFb("");
                    }
                  }}
                  className="bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
                >
                  + Add Member
                </button>
              </div>

              <div className="space-y-2">
                {familyMembers.map(m => (
                  <div key={m.id} className="flex justify-between items-center p-3.5 border rounded-2xl bg-gray-50 text-xs">
                    <div className="flex items-center gap-3">
                      {m.photoUrl && <img src={m.photoUrl} alt={m.name} className="h-9 w-9 rounded-full object-cover" />}
                      <span className="font-bold text-gray-900">{m.name}</span>
                      <span className="text-rose-700 font-semibold">({m.relation})</span>
                      {m.instagramUrl && <span className="text-pink-600">Insta: {m.instagramUrl}</span>}
                      {m.facebookUrl && <span className="text-blue-600">FB: {m.facebookUrl}</span>}
                    </div>
                    <button type="button" onClick={() => setFamilyMembers(familyMembers.filter(x => x.id !== m.id))} className="text-red-500 font-bold hover:underline">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}