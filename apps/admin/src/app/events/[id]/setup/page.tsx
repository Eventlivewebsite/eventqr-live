"use client";

import React, { useState, useEffect, use } from "react";
import { 
  ArrowLeft, CheckCircle2, Loader2, Sparkles, MapPin, 
  Image as ImageIcon, Utensils, Users, Clock, Flame, Film, Sliders
} from "lucide-react";
import Link from "next/link";

export default function EventSetupPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [slug, setSlug] = useState("");

  // 1. Basic & Hero
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [heroTag, setHeroTag] = useState("LIVE EVENT");
  const [bannerUrl, setBannerUrl] = useState("");
  const [highlightUrl, setHighlightUrl] = useState("");

  // 2. Menu Modules Toggles
  const [enabledModules, setEnabledModules] = useState({
    invitation: true,
    family: true,
    guestbook: true,
    foodMenu: true,
  });

  // 3. Trending & Categories
  const [trendingLoved, setTrendingLoved] = useState("Highlights");
  const [trendingViewed, setTrendingViewed] = useState("Special Moments");
  const [trendingDownloaded, setTrendingDownloaded] = useState("Event Album");
  const [categoriesText, setCategoriesText] = useState("Ceremony, Haldi, Mehendi, Reception, Decoration, Party");

  // 4. Timelines
  const [timelineText, setTimelineText] = useState("Wedding Reception | 06:00 PM | LIVE\nDinner | 08:00 PM | UPCOMING\nHaldi Ceremony | 11:00 AM | COMPLETED");

  // 5. Videos / Decoration Clips
  const [videosList, setVideosList] = useState<any[]>([]);
  const [newVidTitle, setNewVidTitle] = useState("");
  const [newVidCat, setNewVidCat] = useState("Decoration");
  const [newVidUrl, setNewVidUrl] = useState("");
  const [newVidThumb, setNewVidThumb] = useState("");

  // 6. Food Items
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodCat, setNewFoodCat] = useState("VEG");
  const [newFoodDesc, setNewFoodDesc] = useState("");

  // 7. Family Members
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState("");

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
          setLocation(ev.venueName || ev.location || "");
          setHeroTag(ev.heroTag || "LIVE EVENT");
          setBannerUrl(ev.heroBannerUrl || "");
          setHighlightUrl(ev.highlightVideoUrl || "");
          setTrendingLoved(ev.trendingLoved || "Highlights");
          setTrendingViewed(ev.trendingViewed || "Special Moments");
          setTrendingDownloaded(ev.trendingDownloaded || "Event Album");

          if (ev.enabledModules) setEnabledModules(ev.enabledModules);
          if (Array.isArray(ev.categoriesList)) setCategoriesText(ev.categoriesList.join(", "));
          if (Array.isArray(ev.timelines) && ev.timelines.length > 0) {
            setTimelineText(ev.timelines.map((t: any) => `${t.title || "Program"} | ${t.time || "TBD"} | ${t.status || "UPCOMING"}`).join("\n"));
          }
          if (Array.isArray(ev.videosList)) setVideosList(ev.videosList);
          if (Array.isArray(ev.foodItems)) setFoodItems(ev.foodItems);
          if (Array.isArray(ev.familyMembers)) setFamilyMembers(ev.familyMembers);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [eventId]);

  const addVideo = () => {
    if (!newVidTitle.trim()) return;
    setVideosList([
      ...videosList,
      {
        id: Date.now(),
        title: newVidTitle.trim(),
        category: newVidCat,
        videoUrl: newVidUrl.trim(),
        thumbnailUrl: newVidThumb.trim() || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
      },
    ]);
    setNewVidTitle("");
    setNewVidUrl("");
    setNewVidThumb("");
  };

  const removeVideo = (id: any) => {
    setVideosList(videosList.filter(v => v.id !== id));
  };

  const addFoodItem = () => {
    if (!newFoodName.trim()) return;
    setFoodItems([
      ...foodItems,
      {
        id: Date.now(),
        name: newFoodName.trim(),
        category: newFoodCat,
        description: newFoodDesc.trim() || "Prepared fresh for guests.",
      },
    ]);
    setNewFoodName("");
    setNewFoodDesc("");
  };

  const addFamilyMember = () => {
    if (!newMemberName.trim()) return;
    setFamilyMembers([
      ...familyMembers,
      {
        id: Date.now(),
        name: newMemberName.trim(),
        relation: newMemberRelation.trim() || "Family Member",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      },
    ]);
    setNewMemberName("");
    setNewMemberRelation("");
  };

  const handlePublish = async () => {
    setSaving(true);
    setMsg("");
    try {
      const categoriesArray = categoriesText.split(",").map(c => c.trim()).filter(Boolean);
      const parsedTimelines = timelineText
        .split("\n")
        .map((line, idx) => {
          const parts = line.split("|").map(p => p.trim());
          if (!parts[0]) return null;
          return {
            id: idx + 1,
            title: parts[0] || "Program",
            time: parts[1] || "TBD",
            status: (parts[2] || "UPCOMING").toUpperCase(),
          };
        })
        .filter(Boolean);

      const payload = {
        venueName: location,
        heroBannerUrl: bannerUrl,
        heroTag,
        highlightVideoUrl: highlightUrl,
        trendingLoved,
        trendingViewed,
        trendingDownloaded,
        categoriesList: categoriesArray,
        timelines: parsedTimelines,
        foodItems,
        familyMembers,
        videosList,
        enabledModules,
      };

      const res = await fetch(`/api/events/${eventId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Everything published to Viewer successfully!");
        setTimeout(() => setMsg(""), 5000);
      } else {
        setMsg("Error saving: " + data.error);
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <Link href="/events" className="text-xs font-semibold text-gray-500 flex items-center gap-1 hover:underline mb-2">
              <ArrowLeft size={14} /> Back to My Events
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-amber-500" /> Event Setup & Complete Publish
            </h1>
            <p className="text-sm text-gray-500">Full dynamic controls for {title}</p>
          </div>

          <div className="flex items-center gap-3">
            {slug && (
              <a
                href={`http://localhost:3000/?event=${slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
              >
                Open Viewer ↗
              </a>
            )}
            <button
              onClick={handlePublish}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:opacity-95 disabled:opacity-50 transition"
            >
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              Publish All to Viewer
            </button>
          </div>
        </div>

        {msg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-sm">
            {msg}
          </div>
        )}

        {/* Section 1: Drawer Menu Modules Enable/Disable */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-3">
          <h2 className="text-md font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
            <Sliders className="text-amber-500 h-4 w-4" /> Viewer Menu Drawer Modules (Turn ON/OFF for this event)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              { key: "foodMenu", label: "Food Menu" },
              { key: "family", label: "Family Section" },
              { key: "invitation", label: "Invitation Card" },
              { key: "guestbook", label: "Guest Book" },
            ].map(mod => (
              <label key={mod.key} className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-xl border">
                <input
                  type="checkbox"
                  checked={(enabledModules as any)[mod.key]}
                  onChange={e => setEnabledModules({ ...enabledModules, [mod.key]: e.target.checked })}
                  className="h-4 w-4 accent-amber-600 rounded"
                />
                <span className="text-xs font-bold text-gray-800">{mod.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Hero & Location */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <ImageIcon className="text-amber-500 h-5 w-5" /> Hero Banner, Location & Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Venue / Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Grand Palace, Jaipur"
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Hero Badge</label>
              <input
                type="text"
                value={heroTag}
                onChange={e => setHeroTag(e.target.value)}
                placeholder="LIVE EVENT / WEDDING CELEBRATION"
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Banner Image URL</label>
              <input
                type="text"
                value={bannerUrl}
                onChange={e => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Highlights Video URL</label>
              <input
                type="text"
                value={highlightUrl}
                onChange={e => setHighlightUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full border rounded-xl p-3 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Videos & Decoration Clips */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Film className="text-amber-500 h-5 w-5" /> Decoration & Event Videos ({videosList.length} Added)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-purple-50/50 p-4 rounded-xl border border-purple-200">
            <input
              type="text"
              placeholder="Clip Title (e.g. Stage Decor)"
              value={newVidTitle}
              onChange={e => setNewVidTitle(e.target.value)}
              className="border rounded-xl p-2.5 text-sm bg-white outline-none"
            />
            <input
              type="text"
              placeholder="Category (e.g. Decoration, Haldi)"
              value={newVidCat}
              onChange={e => setNewVidCat(e.target.value)}
              className="border rounded-xl p-2.5 text-sm bg-white outline-none"
            />
            <input
              type="text"
              placeholder="Video URL"
              value={newVidUrl}
              onChange={e => setNewVidUrl(e.target.value)}
              className="border rounded-xl p-2.5 text-sm bg-white outline-none"
            />
            <button
              onClick={addVideo}
              className="bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition"
            >
              + Add Video
            </button>
          </div>
          <div className="space-y-2">
            {videosList.map(v => (
              <div key={v.id} className="flex justify-between items-center p-3 border rounded-xl bg-gray-50 text-sm">
                <div>
                  <span className="font-bold text-gray-900">{v.title}</span>
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 font-semibold">{v.category}</span>
                </div>
                <button onClick={() => removeVideo(v.id)} className="text-red-500 text-xs font-bold hover:underline">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Food Menu */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Utensils className="text-amber-500 h-5 w-5" /> Food Menu & Drinks ({foodItems.length} Added)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
            <input
              type="text"
              placeholder="Dish Name"
              value={newFoodName}
              onChange={e => setNewFoodName(e.target.value)}
              className="border rounded-xl p-2.5 text-sm bg-white outline-none"
            />
            <select
              value={newFoodCat}
              onChange={e => setNewFoodCat(e.target.value)}
              className="border rounded-xl p-2.5 text-sm bg-white font-semibold outline-none"
            >
              <option value="VEG">🌱 Vegetarian</option>
              <option value="NON_VEG">🍗 Non-Veg</option>
              <option value="DRINK">🍹 Drink / Beverage</option>
            </select>
            <input
              type="text"
              placeholder="Description"
              value={newFoodDesc}
              onChange={e => setNewFoodDesc(e.target.value)}
              className="border rounded-xl p-2.5 text-sm bg-white outline-none"
            />
            <button
              onClick={addFoodItem}
              className="bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition"
            >
              + Add Dish
            </button>
          </div>
        </div>

        {/* Section 5: Family Members */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Users className="text-amber-500 h-5 w-5" /> Family Members ({familyMembers.length} Added)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-200">
            <input
              type="text"
              placeholder="Member Name"
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              className="border rounded-xl p-2.5 text-sm bg-white outline-none"
            />
            <input
              type="text"
              placeholder="Relation (e.g. Groom Father)"
              value={newMemberRelation}
              onChange={e => setNewMemberRelation(e.target.value)}
              className="border rounded-xl p-2.5 text-sm bg-white outline-none"
            />
            <button
              onClick={addFamilyMember}
              className="bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition"
            >
              + Add Family
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}