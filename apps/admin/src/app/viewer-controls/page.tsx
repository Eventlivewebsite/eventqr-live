"use client";

import React, { useEffect, useState } from "react";
import { Shield, Play, Pause, CheckCircle2, XCircle, Trash2, RefreshCw } from "lucide-react";

export default function ViewerControlsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [photos, setPhotos] = useState<any[]>([]);
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/events?activeOnly=true")
      .then(res => res.json())
      .then(data => {
        const evList = data.events || [];
        setEvents(evList);
        if (evList.length > 0) setSelectedEventId(evList[0].id);
      });
  }, []);

  const loadFeedData = async (eventId: string) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/viewer-controls?eventId=${eventId}`);
      const data = await res.json();
      setPhotos(data.photos || []);
      setIsFeedPaused(data.event?.liveFeedPaused || false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) loadFeedData(selectedEventId);
  }, [selectedEventId]);

  const toggleFeedPause = async () => {
    const updated = !isFeedPaused;
    setIsFeedPaused(updated);
    await fetch("/api/viewer-controls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: selectedEventId, liveFeedPaused: updated })
    });
  };

  const handleAction = async (photoId: string, action: string) => {
    await fetch("/api/viewer-controls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, action })
    });
    loadFeedData(selectedEventId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-pink-500" />
            Viewer Feed Moderation
          </h1>
          <p className="text-sm text-gray-500">Live Big Screen feed control and guest upload approval panel.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="p-2 border rounded-xl text-sm bg-white dark:bg-zinc-900"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name} ({ev.eventType})</option>
            ))}
          </select>

          <button
            onClick={toggleFeedPause}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
              isFeedPaused ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
            }`}
          >
            {isFeedPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isFeedPaused ? "Resume Live Screen" : "Pause Live Screen"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading feed assets...</div>
      ) : photos.length === 0 ? (
        <div className="p-12 text-center text-gray-400 border rounded-2xl">No uploads found for this event yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="relative group border rounded-xl overflow-hidden shadow-sm bg-black/5">
              <img src={p.url} alt="feed item" className="w-full h-40 object-cover" />
              <div className="p-2 bg-white dark:bg-zinc-900 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  p.isApproved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {p.isApproved ? "ON SCREEN" : "HIDDEN"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAction(p.id, "TOGGLE_APPROVE")}
                    title={p.isApproved ? "Hide from Screen" : "Approve for Screen"}
                    className="p-1 hover:bg-gray-100 rounded text-gray-700 dark:text-gray-300"
                  >
                    {p.isApproved ? <XCircle className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => handleAction(p.id, "DELETE")}
                    title="Delete permanently"
                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
