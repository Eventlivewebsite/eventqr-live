"use client";

import React, { useState, useEffect, use } from "react";
import { 
  ArrowLeft, CheckCircle2, Loader2, Sparkles, MapPin, 
  Image as ImageIcon, Utensils, Users, Clock, Film, 
  Upload, Trash2, Mail
} from "lucide-react";
import Link from "next/link";

export default function EventSetupPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [slug, setSlug] = useState("");

  // 1. Basic Metadata
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

  // 3. Invitation Card Customizer
  const [inviteBadge, setInviteBadge] = useState("WEDDING INVITATION");
  const [inviteCoupleInitials, setInviteCoupleInitials] = useState("A & S");
  const [inviteTagline, setInviteTagline] = useState("Together Forever");
  const [inviteMessage, setInviteMessage] = useState("Together with our families we request the honour of your presence to celebrate our wedding ceremony and blessings.");
  const [inviteDateText, setInviteDateText] = useState("15 February 2027");
  const [inviteTimeText, setInviteTimeText] = useState("07:00 PM Onwards");
  const [inviteVenueText, setInviteVenueText] = useState("Jaipur Palace, Rajasthan");

  // 4. Unified Categories & Decoration Hub (Applies to both Photos & Videos)
  const [commonCategories, setCommonCategories] = useState<string[]>([
    "Ceremony", "Haldi", "Mehendi", "Reception", "Family", "Party"
  ]);
  const [newCategory, setNewCategory] = useState("");

  const [decorationAlbums, setDecorationAlbums] = useState<string[]>([
    "Wedding Stage", "Floral Decoration", "Lighting", "Entrance", "Dining", "Selfie Booth", "Reception Hall"
  ]);
  const [newDecorItem, setNewDecorItem] = useState("");

  // 5. Timelines
  const [showTimeline, setShowTimeline] = useState(true);
  const [timelines, setTimelines] = useState<any[]>([
    { id: 1, title: "Wedding Reception", timeText: "06:00 PM", statusText: "LIVE" },
    { id: 2, title: "Dinner", timeText: "08:00 PM", statusText: "UPCOMING" },
    { id: 3, title: "Haldi Ceremony", timeText: "11:00 AM", statusText: "COMPLETED" },
  ]);
  const [progTitle, setProgTitle] = useState("");
  const [progTime, setProgTime] = useState("");
  const [progStatus, setProgStatus] = useState("UPCOMING");

  // 6. Food & Drinks Feast
  const [showFoodMenu, setShowFoodMenu] = useState(true);
  const [foodItems, setFoodItems] = useState<any[]>([
    { id: 1, name: "Paneer Tikka Royale", category: "VEG", description: "Charcoal grilled cottage cheese with aromatic spices", photoUrl: "" },
    { id: 2, name: "Royal Blue Lagoon", category: "DRINK", description: "Refreshing blue curaçao mocktail with citrus notes", photoUrl: "" }
  ]);
  const [dishName, setDishName] = useState("");
  const [dishCat, setDishCat] = useState<"VEG" | "NON_VEG" | "DRINK">("VEG");
  const [dishDesc, setDishDesc] = useState("");
  const [dishPhoto, setDishPhoto] = useState("");

  // 7. Family Members (Single Luxury Cards)
  const [showFamily, setShowFamily] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<any[]>([
    { id: 1, name: "Rajesh Sharma", relation: "Father of the Bride", photoUrl: "", instagramUrl: "", facebookUrl: "" }
  ]);
  const [memName, setMemName] = useState("");
  const [memRelation, setMemRelation] = useState("");
  const [memPhoto, setMemPhoto] = useState("");
  const [memInsta, setMemInsta] = useState("");
  const [memFb, setMemFb] = useState("");

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
          if (cm.subtitle) setSubtitle(cm.subtitle);
          if (cm.scheduledPublishDate) setScheduledPublishDate(cm.scheduledPublishDate);
          if (cm.highlightType) setHighlightType(cm.highlightType as any);
          if (cm.highlightVideoUrl) setHighlightVideoUrl(cm.highlightVideoUrl);
          if (cm.ourStoryUrl) setOurStoryUrl(cm.ourStoryUrl);
          if (cm.ceremonyName) setCeremonyName(cm.ceremonyName);

          // Invitation
          if (cm.inviteBadge) setInviteBadge(cm.inviteBadge);
          if (cm.inviteCoupleInitials) setInviteCoupleInitials(cm.inviteCoupleInitials);
          if (cm.inviteTagline) setInviteTagline(cm.inviteTagline);
          if (cm.inviteMessage) setInviteMessage(cm.inviteMessage);
          if (cm.inviteDateText) setInviteDateText(cm.inviteDateText);
          if (cm.inviteTimeText) setInviteTimeText(cm.inviteTimeText);
          if (cm.inviteVenueText) setInviteVenueText(cm.inviteVenueText);

          try { if (cm.highlightPhotos) setHighlightPhotos(JSON.parse(cm.highlightPhotos)); } catch {}
          try { if (cm.photoCategories) setCommonCategories(JSON.parse(cm.photoCategories)); } catch {}
          try { if (cm.decorationItems) setDecorationAlbums(JSON.parse(cm.decorationItems)); } catch {}
          try { if (cm.timelines) setTimelines(JSON.parse(cm.timelines)); } catch {}
          try { if (cm.foodItems) setFoodItems(JSON.parse(cm.foodItems)); } catch {}
          try { if (cm.familyMembers) setFamilyMembers(JSON.parse(cm.familyMembers)); } catch {}

          if (cm.showTimeline !== undefined) setShowTimeline(cm.showTimeline === "true");
          if (cm.showFoodMenu !== undefined) setShowFoodMenu(cm.showFoodMenu === "true");
          if (cm.showFamily !== undefined) setShowFamily(cm.showFamily === "true");
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
        scheduledPublishDate,
        highlightType,
        highlightVideoUrl,
        highlightPhotos,
        ourStoryUrl,
        ceremonyName,
        // Invitation
        inviteBadge,
        inviteCoupleInitials,
        inviteTagline,
        inviteMessage,
        inviteDateText,
        inviteTimeText,
        inviteVenueText,
        // Categories & Decoration synced for both
        photoCategories: commonCategories,
        videoCategories: commonCategories,
        decorationItems: decorationAlbums,
        showDecoration: true,
        // Timelines & Modules
        showTimeline,
        timelines,
        showFoodMenu,
        foodItems,
        showFamily,
        familyMembers,
      };

      const res = await fetch(`/api/events/${eventId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Configuration saved and published to Live Viewer!");
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Master Header */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

        {/* 1. Basic Metadata */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <MapPin className="text-amber-500 h-5 w-5" /> 1. Event Headings, Venue & Publish Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. A & S Wedding"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="e.g. Forever Begins Today"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Venue / Location</label>
              <input
                type="text"
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                placeholder="e.g. Jaipur Palace, Rajasthan"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Live Publish Date</label>
              <input
                type="date"
                value={scheduledPublishDate}
                onChange={e => setScheduledPublishDate(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Hero Highlights & Ceremony Countdown */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Film className="text-amber-500 h-5 w-5" /> 2. Hero Banner & Countdown Card
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
              <label className="text-xs font-bold text-gray-700 uppercase">Ceremony Name (Inside Countdown Card)</label>
              <input
                type="text"
                value={ceremonyName}
                onChange={e => setCeremonyName(e.target.value)}
                placeholder="e.g. Wedding Reception"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Our Story / Info URL</label>
              <input
                type="text"
                value={ourStoryUrl}
                onChange={e => setOurStoryUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {highlightType === "video" ? (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Highlight Video Stream/MP4 Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={highlightVideoUrl}
                  onChange={e => setHighlightVideoUrl(e.target.value)}
                  placeholder="https://...mp4"
                  className="flex-1 border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
                />
                <label className="cursor-pointer bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100">
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
                <label className="text-xs font-bold text-gray-700 uppercase">Hero Slideshow Photos ({highlightPhotos.length})</label>
                <label className="cursor-pointer bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-amber-600">
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

        {/* 3. Invitation Card Customizer */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Mail className="text-rose-500 h-5 w-5" /> 3. Digital Invitation Card Customizer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Top Badge Title</label>
              <input
                type="text"
                value={inviteBadge}
                onChange={e => setInviteBadge(e.target.value)}
                placeholder="WEDDING INVITATION"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Initials (Large Text)</label>
              <input
                type="text"
                value={inviteCoupleInitials}
                onChange={e => setInviteCoupleInitials(e.target.value)}
                placeholder="A & S"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Tagline</label>
              <input
                type="text"
                value={inviteTagline}
                onChange={e => setInviteTagline(e.target.value)}
                placeholder="Together Forever"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase">Invitation Message</label>
            <textarea
              rows={2}
              value={inviteMessage}
              onChange={e => setInviteMessage(e.target.value)}
              placeholder="Together with our families we request..."
              className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Event Date Text</label>
              <input
                type="text"
                value={inviteDateText}
                onChange={e => setInviteDateText(e.target.value)}
                placeholder="15 February 2027"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Event Time Text</label>
              <input
                type="text"
                value={inviteTimeText}
                onChange={e => setInviteTimeText(e.target.value)}
                placeholder="07:00 PM Onwards"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Venue Address Text</label>
              <input
                type="text"
                value={inviteVenueText}
                onChange={e => setInviteVenueText(e.target.value)}
                placeholder="Jaipur Palace, Rajasthan"
                className="mt-1 w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Unified Categories & Decoration Hub */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="text-amber-500 h-5 w-5" /> 4. Unified Categories & Decoration Hub
            </h2>
            <p className="text-xs text-gray-500 mt-1">Changes made here automatically apply to both Photos and Videos sections.</p>
          </div>

          {/* Gallery Category Chips */}
          <div>
            <span className="text-xs font-bold text-gray-700 uppercase">Active Categories (Photos & Videos)</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {commonCategories.map((c, i) => (
                <span key={i} className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  {c}
                  <button type="button" onClick={() => setCommonCategories(commonCategories.filter((_, idx) => idx !== i))} className="hover:text-red-500 font-bold ml-1">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-3 max-w-md">
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Add category tag..."
                className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none flex-1 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => { if (newCategory.trim()) { setCommonCategories([...commonCategories, newCategory.trim()]); setNewCategory(""); } }}
                className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-700"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Decoration Albums */}
          <div className="pt-2 border-t">
            <span className="text-xs font-bold text-gray-700 uppercase">Decoration Drawer Albums (Photos & Videos)</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {decorationAlbums.map((item, i) => (
                <span key={i} className="bg-rose-50 border border-rose-200 text-rose-900 px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  🌸 {item}
                  <button type="button" onClick={() => setDecorationAlbums(decorationAlbums.filter((_, idx) => idx !== i))} className="hover:text-red-500 font-bold ml-1">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-3 max-w-md">
              <input
                type="text"
                value={newDecorItem}
                onChange={e => setNewDecorItem(e.target.value)}
                placeholder="e.g. Wedding Stage / Lighting"
                className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none flex-1 focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => { if (newDecorItem.trim()) { setDecorationAlbums([...decorationAlbums, newDecorItem.trim()]); setNewDecorItem(""); } }}
                className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-700"
              >
                + Add Album
              </button>
            </div>
          </div>
        </div>

        {/* 5. Program Schedule */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-amber-500 h-5 w-5" /> 5. Program Schedule & Live Timelines
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showTimeline}
                onChange={e => setShowTimeline(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
              Timeline ON
            </label>
          </div>

          {showTimeline && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <input
                  type="text"
                  placeholder="Program (e.g. Reception)"
                  value={progTitle}
                  onChange={e => setProgTitle(e.target.value)}
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="Time (e.g. 06:00 PM)"
                  value={progTime}
                  onChange={e => setProgTime(e.target.value)}
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none"
                />
                <select
                  value={progStatus}
                  onChange={e => setProgStatus(e.target.value)}
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white font-bold outline-none"
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
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${t.statusText === "LIVE" ? "bg-red-500 text-white" : t.statusText === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
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

        {/* 6. Food & Drinks Feast */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
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
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none"
                />
                <select
                  value={dishCat}
                  onChange={e => setDishCat(e.target.value as any)}
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white font-bold outline-none"
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
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none"
                />
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50">
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

        {/* 7. Family Members (Single Luxury Cards) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
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
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="Relation (e.g. Bride's Father)"
                  value={memRelation}
                  onChange={e => setMemRelation(e.target.value)}
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="Instagram Link"
                  value={memInsta}
                  onChange={e => setMemInsta(e.target.value)}
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="Facebook Link"
                  value={memFb}
                  onChange={e => setMemFb(e.target.value)}
                  className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-white placeholder-gray-400 outline-none"
                />
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-2 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50">
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