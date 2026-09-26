"use client";

import React, { useState, useEffect, use } from "react";
import { 
  ArrowLeft, CheckCircle2, Loader2, Sparkles, MapPin, 
  Image as ImageIcon, Utensils, Users, Clock, Flame, Film, 
  Music, Instagram, Facebook, Upload, Trash2, Plus, Calendar, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";

export default function EventSetupPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [slug, setSlug] = useState("");

  // 1. Hero Highlights (Video continuously playing or Min 5 Slideshow Photos)
  const [highlightType, setHighlightType] = useState<"video" | "photos">("video");
  const [highlightVideoUrl, setHighlightVideoUrl] = useState("");
  const [highlightPhotos, setHighlightPhotos] = useState<string[]>([]);
  const [newPhotoInput, setNewPhotoInput] = useState("");

  // 2. Heading, Title, Location & Dates
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [venueName, setVenueName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [scheduledPublishDate, setScheduledPublishDate] = useState("");
  const [heroTag, setHeroTag] = useState("LIVE EVENT");

  // 3. Video Categories & Video Decoration Section
  const [videoCategories, setVideoCategories] = useState<string[]>(["Highlights", "Ceremony", "Haldi", "Reception", "Entry"]);
  const [videoDecorationCategories, setVideoDecorationCategories] = useState<string[]>(["Stage Decor", "Entry Gate", "Mandap", "Lighting"]);
  const [showVideoDecoration, setShowVideoDecoration] = useState(true);
  const [newVidCat, setNewVidCat] = useState("");
  const [newVidDecorCat, setNewVidDecorCat] = useState("");

  // 4. Photo Categories & Photo Decoration Section
  const [photoCategories, setPhotoCategories] = useState<string[]>(["Ceremony", "Haldi", "Mehendi", "Reception", "Family", "Candid"]);
  const [photoDecorationCategories, setPhotoDecorationCategories] = useState<string[]>(["Flower Setup", "Table Arrangements", "Photo Booth", "Stage View"]);
  const [showPhotoDecoration, setShowPhotoDecoration] = useState(true);
  const [newPhotoCat, setNewPhotoCat] = useState("");
  const [newPhotoDecorCat, setNewPhotoDecorCat] = useState("");

  // 5. Timeline / Program Schedule (Live Control)
  const [showTimeline, setShowTimeline] = useState(true);
  const [timelines, setTimelines] = useState<any[]>([
    { id: 1, title: "Grand Entry", timeText: "06:30 PM", statusText: "COMPLETED" },
    { id: 2, title: "Reception & Blessings", timeText: "08:00 PM", statusText: "LIVE" },
    { id: 3, title: "Royal Dinner", timeText: "09:30 PM", statusText: "UPCOMING" },
  ]);
  const [newProgTitle, setNewProgTitle] = useState("");
  const [newProgTime, setNewProgTime] = useState("");
  const [newProgStatus, setNewProgStatus] = useState("UPCOMING");

  // 6. Food & Drink Menu (Instant Upload)
  const [showFoodMenu, setShowFoodMenu] = useState(true);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [foodName, setFoodName] = useState("");
  const [foodCat, setFoodCat] = useState("VEG");
  const [foodDesc, setFoodDesc] = useState("");
  const [foodPhoto, setFoodPhoto] = useState("");

  // 7. Family Members Section with Social Links (Instagram / Facebook)
  const [showFamily, setShowFamily] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [memName, setMemName] = useState("");
  const [memRelation, setMemRelation] = useState("");
  const [memBio, setMemBio] = useState("");
  const [memPhoto, setMemPhoto] = useState("");
  const [memInsta, setMemInsta] = useState("");
  const [memFb, setMemFb] = useState("");

  // 8. Playlist / Songs Section (Master Toggle ON/OFF)
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [playlist, setPlaylist] = useState<any[]>([
    { id: 1, title: "Din Shagna Da", artist: "Wedding Special", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
  ]);
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songUrl, setSongUrl] = useState("");

  useEffect(() => {
    async function loadData() {
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
          setSubtitle(cm.subtitle || "Forever Begins Today");
          setScheduledPublishDate(cm.scheduledPublishDate || "");
          setHighlightType((cm.highlightType as any) || "video");
          setHighlightVideoUrl(cm.highlightVideoUrl || ev.highlightVideoUrl || "");
          
          try { if (cm.highlightPhotos) setHighlightPhotos(JSON.parse(cm.highlightPhotos)); } catch {}
          try { if (cm.videoCategories) setVideoCategories(JSON.parse(cm.videoCategories)); } catch {}
          try { if (cm.videoDecorationCategories) setVideoDecorationCategories(JSON.parse(cm.videoDecorationCategories)); } catch {}
          try { if (cm.photoCategories) setPhotoCategories(JSON.parse(cm.photoCategories)); } catch {}
          try { if (cm.photoDecorationCategories) setPhotoDecorationCategories(JSON.parse(cm.photoDecorationCategories)); } catch {}
          try { if (cm.timelines) setTimelines(JSON.parse(cm.timelines)); } catch {}
          try { if (cm.foodItems) setFoodItems(JSON.parse(cm.foodItems)); } catch {}
          try { if (cm.familyMembers) setFamilyMembers(JSON.parse(cm.familyMembers)); } catch {}
          try { if (cm.playlist) setPlaylist(JSON.parse(cm.playlist)); } catch {}

          if (cm.showVideoDecoration !== undefined) setShowVideoDecoration(cm.showVideoDecoration === "true");
          if (cm.showPhotoDecoration !== undefined) setShowPhotoDecoration(cm.showPhotoDecoration === "true");
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
    loadData();
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

  const handleSaveAll = async () => {
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        venueName,
        heroTag,
        highlightVideoUrl,
        subtitle,
        scheduledPublishDate,
        highlightType,
        highlightPhotos,
        videoCategories,
        videoDecorationCategories,
        showVideoDecoration,
        photoCategories,
        photoDecorationCategories,
        showPhotoDecoration,
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
        setMsg("Everything saved and published to Viewer live!");
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

        {/* Top Header */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/events" className="text-xs font-semibold text-gray-500 flex items-center gap-1 hover:underline mb-2">
              <ArrowLeft size={14} /> Back to Events
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-amber-500" /> Event Master Setup & Live Customizer
            </h1>
            <p className="text-xs text-gray-500">Live configuration for {title || "Event"}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {slug && (
              <a
                href={`http://localhost:3000/?event=${slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
              >
                Open Live Viewer ↗
              </a>
            )}
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:opacity-95 disabled:opacity-50 transition"
            >
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              Publish to Viewer
            </button>
          </div>
        </div>

        {msg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-sm">
            {msg}
          </div>
        )}

        {/* 1. HERO HIGHLIGHTS: Video Continuously Playing OR Min 5 Photos Slideshow */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Film className="text-amber-500 h-5 w-5" /> 1. Hero Highlights (Video Loop / Photo Slideshow)
            </h2>
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setHighlightType("video")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${highlightType === "video" ? "bg-white text-gray-900 shadow" : "text-gray-500"}`}
              >
                Continuous Video
              </button>
              <button
                type="button"
                onClick={() => setHighlightType("photos")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${highlightType === "photos" ? "bg-white text-gray-900 shadow" : "text-gray-500"}`}
              >
                Slideshow Photos (Min 5)
              </button>
            </div>
          </div>

          {highlightType === "video" ? (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700">Highlight Video URL (Continuously Loops in Hero)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={highlightVideoUrl}
                  onChange={e => setHighlightVideoUrl(e.target.value)}
                  placeholder="https://...mp4 or YouTube link"
                  className="flex-1 border rounded-xl p-2.5 text-sm outline-none"
                />
                <label className="cursor-pointer bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100">
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">
                  Slideshow Photos ({highlightPhotos.length} / 5 minimum)
                </label>
                <label className="cursor-pointer bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Upload size={14} /> Upload Slide Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], "slideshow", url => setHighlightPhotos([...highlightPhotos, url]));
                      }
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-5 gap-3 pt-2">
                {highlightPhotos.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border h-24 bg-gray-100">
                    <img src={img} alt={`Slide ${i+1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setHighlightPhotos(highlightPhotos.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-red-600 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. HEADING, TITLE, LOCATION & DATES */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <MapPin className="text-amber-500 h-5 w-5" /> 2. Event Title, Venue & Publish Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Event Title / Heading</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Rohit & Priya's Wedding"
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="Forever Begins Today"
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Venue / Location Name</label>
              <input
                type="text"
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                placeholder="Grand Heritage Palace, Jaipur"
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Viewer Publish Date (Scheduled)</label>
              <input
                type="date"
                value={scheduledPublishDate}
                onChange={e => setScheduledPublishDate(e.target.value)}
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. VIDEO CATEGORIES & VIDEO DECORATION */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Film className="text-amber-500 h-5 w-5" /> 3. Video Categories & Decoration
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showVideoDecoration}
                onChange={e => setShowVideoDecoration(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              Video Decoration Section ON
            </label>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-600 uppercase">Video Categories</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {videoCategories.map((c, i) => (
                <span key={i} className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  {c}
                  <button type="button" onClick={() => setVideoCategories(videoCategories.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newVidCat}
                onChange={e => setNewVidCat(e.target.value)}
                placeholder="Add video category..."
                className="border rounded-xl p-2 text-xs outline-none flex-1"
              />
              <button
                type="button"
                onClick={() => { if (newVidCat.trim()) { setVideoCategories([...videoCategories, newVidCat.trim()]); setNewVidCat(""); } }}
                className="bg-amber-600 text-white px-3 py-2 rounded-xl text-xs font-bold"
              >
                + Add
              </button>
            </div>
          </div>

          {showVideoDecoration && (
            <div className="pt-2 border-t">
              <span className="text-xs font-bold text-gray-600 uppercase">Video Decoration Categories</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {videoDecorationCategories.map((c, i) => (
                  <span key={i} className="bg-purple-50 border border-purple-200 text-purple-900 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    {c}
                    <button type="button" onClick={() => setVideoDecorationCategories(videoDecorationCategories.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newVidDecorCat}
                  onChange={e => setNewVidDecorCat(e.target.value)}
                  placeholder="Add decoration video category..."
                  className="border rounded-xl p-2 text-xs outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={() => { if (newVidDecorCat.trim()) { setVideoDecorationCategories([...videoDecorationCategories, newVidDecorCat.trim()]); setNewVidDecorCat(""); } }}
                  className="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-bold"
                >
                  + Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. PHOTO CATEGORIES & PHOTO DECORATION */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="text-amber-500 h-5 w-5" /> 4. Photo Categories & Decoration
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showPhotoDecoration}
                onChange={e => setShowPhotoDecoration(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              Photo Decoration Section ON
            </label>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-600 uppercase">Photo Categories</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {photoCategories.map((c, i) => (
                <span key={i} className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  {c}
                  <button type="button" onClick={() => setPhotoCategories(photoCategories.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newPhotoCat}
                onChange={e => setNewPhotoCat(e.target.value)}
                placeholder="Add photo category..."
                className="border rounded-xl p-2 text-xs outline-none flex-1"
              />
              <button
                type="button"
                onClick={() => { if (newPhotoCat.trim()) { setPhotoCategories([...photoCategories, newPhotoCat.trim()]); setNewPhotoCat(""); } }}
                className="bg-amber-600 text-white px-3 py-2 rounded-xl text-xs font-bold"
              >
                + Add
              </button>
            </div>
          </div>

          {showPhotoDecoration && (
            <div className="pt-2 border-t">
              <span className="text-xs font-bold text-gray-600 uppercase">Photo Decoration Categories</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {photoDecorationCategories.map((c, i) => (
                  <span key={i} className="bg-rose-50 border border-rose-200 text-rose-900 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    {c}
                    <button type="button" onClick={() => setPhotoDecorationCategories(photoDecorationCategories.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newPhotoDecorCat}
                  onChange={e => setNewPhotoDecorCat(e.target.value)}
                  placeholder="Add decoration photo category..."
                  className="border rounded-xl p-2 text-xs outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={() => { if (newPhotoDecorCat.trim()) { setPhotoDecorationCategories([...photoDecorationCategories, newPhotoDecorCat.trim()]); setNewPhotoDecorCat(""); } }}
                  className="bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold"
                >
                  + Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. TIMELINES & SCHEDULE (LIVE CONTROL) */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-amber-500 h-5 w-5" /> 5. Program Schedule & Live Timelines
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showTimeline}
                onChange={e => setShowTimeline(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              Timeline Section ON
            </label>
          </div>

          {showTimeline && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                <input
                  type="text"
                  placeholder="Program (e.g. Ring Ceremony)"
                  value={newProgTitle}
                  onChange={e => setNewProgTitle(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Time (e.g. 07:30 PM)"
                  value={newProgTime}
                  onChange={e => setNewProgTime(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <select
                  value={newProgStatus}
                  onChange={e => setNewProgStatus(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white font-bold outline-none"
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="LIVE">🔴 LIVE NOW</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (newProgTitle.trim()) {
                      setTimelines([...timelines, { id: Date.now(), title: newProgTitle.trim(), timeText: newProgTime.trim() || "TBD", statusText: newProgStatus }]);
                      setNewProgTitle("");
                      setNewProgTime("");
                    }
                  }}
                  className="bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition"
                >
                  + Add Program
                </button>
              </div>

              <div className="space-y-2">
                {timelines.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 border rounded-xl bg-gray-50 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${t.statusText === "LIVE" ? "bg-red-500 text-white animate-pulse" : t.statusText === "COMPLETED" ? "bg-gray-200 text-gray-700" : "bg-amber-100 text-amber-800"}`}>
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

        {/* 6. FOOD & DRINK ITEMS (INSTANT UPLOAD) */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Utensils className="text-amber-500 h-5 w-5" /> 6. Food Menu & Instant Photo Upload
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                <input
                  type="text"
                  placeholder="Dish Name"
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <select
                  value={foodCat}
                  onChange={e => setFoodCat(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white font-bold outline-none"
                >
                  <option value="VEG">🌱 Vegetarian</option>
                  <option value="NON_VEG">🍗 Non-Veg</option>
                  <option value="DRINK">🍹 Drink / Beverage</option>
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={foodDesc}
                  onChange={e => setFoodDesc(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <label className="cursor-pointer bg-white border text-gray-700 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50">
                  <Upload size={14} /> {foodPhoto ? "Photo Attached" : "Dish Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], "food", url => setFoodPhoto(url));
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (foodName.trim()) {
                      setFoodItems([...foodItems, { id: Date.now(), name: foodName.trim(), category: foodCat, description: foodDesc.trim() || "Freshly served.", photoUrl: foodPhoto }]);
                      setFoodName("");
                      setFoodDesc("");
                      setFoodPhoto("");
                    }
                  }}
                  className="bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition"
                >
                  + Add Dish
                </button>
              </div>

              <div className="space-y-2">
                {foodItems.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-3 border rounded-xl bg-gray-50 text-xs">
                    <div className="flex items-center gap-3">
                      {f.photoUrl && <img src={f.photoUrl} alt={f.name} className="h-8 w-8 rounded-lg object-cover" />}
                      <span className="font-bold text-gray-900">{f.name}</span>
                      <span className="text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">{f.category}</span>
                      <span className="text-gray-500">{f.description}</span>
                    </div>
                    <button type="button" onClick={() => setFoodItems(foodItems.filter(x => x.id !== f.id))} className="text-red-500 font-bold hover:underline">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. FAMILY MEMBERS WITH SOCIAL LINKS (INSTAGRAM / FACEBOOK) */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-amber-500 h-5 w-5" /> 7. Family Members & Social Profiles
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
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-200">
                <input
                  type="text"
                  placeholder="Member Name"
                  value={memName}
                  onChange={e => setMemName(e.target.value)}
                  className="border rounded-xl p-2 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Relation (e.g. Groom's Brother)"
                  value={memRelation}
                  onChange={e => setMemRelation(e.target.value)}
                  className="border rounded-xl p-2 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Instagram Link"
                  value={memInsta}
                  onChange={e => setMemInsta(e.target.value)}
                  className="border rounded-xl p-2 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Facebook Link"
                  value={memFb}
                  onChange={e => setMemFb(e.target.value)}
                  className="border rounded-xl p-2 text-xs bg-white outline-none"
                />
                <label className="cursor-pointer bg-white border text-gray-700 px-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50">
                  <Upload size={12} /> {memPhoto ? "Photo Selected" : "Upload Photo"}
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
                  <div key={m.id} className="flex justify-between items-center p-3 border rounded-xl bg-gray-50 text-xs">
                    <div className="flex items-center gap-3">
                      {m.photoUrl && <img src={m.photoUrl} alt={m.name} className="h-8 w-8 rounded-full object-cover" />}
                      <span className="font-bold text-gray-900">{m.name}</span>
                      <span className="text-rose-700 font-semibold">({m.relation})</span>
                      {m.instagramUrl && <span className="text-pink-600 font-medium">Insta: {m.instagramUrl}</span>}
                      {m.facebookUrl && <span className="text-blue-600 font-medium">FB: {m.facebookUrl}</span>}
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

        {/* 8. SONGS / PLAYLIST SECTION (MASTER TOGGLE ON/OFF) */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Music className="text-amber-500 h-5 w-5" /> 8. Event Songs / Playlist Player
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showPlaylist}
                onChange={e => setShowPlaylist(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              Playlist Section ON
            </label>
          </div>

          {showPlaylist && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-purple-50/50 p-4 rounded-xl border border-purple-200">
                <input
                  type="text"
                  placeholder="Song Title"
                  value={songTitle}
                  onChange={e => setSongTitle(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Artist / Mood"
                  value={songArtist}
                  onChange={e => setSongArtist(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Audio URL (.mp3 or stream link)"
                  value={songUrl}
                  onChange={e => setSongUrl(e.target.value)}
                  className="border rounded-xl p-2.5 text-xs bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (songTitle.trim()) {
                      setPlaylist([...playlist, { id: Date.now(), title: songTitle.trim(), artist: songArtist.trim() || "Event Special", url: songUrl.trim() }]);
                      setSongTitle("");
                      setSongArtist("");
                      setSongUrl("");
                    }
                  }}
                  className="bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
                >
                  + Add Track
                </button>
              </div>

              <div className="space-y-2">
                {playlist.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 border rounded-xl bg-gray-50 text-xs">
                    <div className="flex items-center gap-3">
                      <Music size={14} className="text-purple-600" />
                      <span className="font-bold text-gray-900">{s.title}</span>
                      <span className="text-purple-800 font-semibold">({s.artist})</span>
                      <span className="text-gray-400 truncate max-w-xs">{s.url}</span>
                    </div>
                    <button type="button" onClick={() => setPlaylist(playlist.filter(x => x.id !== s.id))} className="text-red-500 font-bold hover:underline">
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