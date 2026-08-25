"use client";

import { useState } from "react";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  adminId: string;
}

export default function AddEventModal({
  open,
  onClose,
  clientId,
  adminId,
}: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [type, setType] = useState("WEDDING");
  const [loading, setLoading] = useState(false);

  async function handleCreateEvent() {
    if (loading) return;

    if (!title.trim()) {
      alert("Please enter Event Title.");
      return;
    }

    if (!clientId) {
      alert("Client ID not found.");
      return;
    }

    try {
      setLoading(true);

      const slug = title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const payload = {
       adminId,
        clientId,
        title: title.trim(),
        brideName: brideName.trim() || null,
        groomName: groomName.trim() || null,
        clientName: "",
        slug,
        type,
        eventDate: eventDate || null,
        location: location.trim() || null,
      };

      console.log("EVENT PAYLOAD:", payload);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("EVENT RESPONSE:", data);

      if (!response.ok) {
        alert(data.message || "Failed to create event.");
        console.error(data);
        return;
      }

      alert("✅ Event Created Successfully");

      setTitle("");
      setBrideName("");
      setGroomName("");
      setLocation("");
      setEventDate("");
      setType("WEDDING");

      onClose();

      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h2 className="text-3xl font-bold text-white">
              Create Event
            </h2>

            <p className="mt-2 text-slate-400">
              Create a new event for this client.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-red-500 px-4 py-2 text-white"
          >
            ✕
          </button>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <input
            value={brideName}
            onChange={(e) => setBrideName(e.target.value)}
            placeholder="Bride Name"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <input
            value={groomName}
            onChange={(e) => setGroomName(e.target.value)}
            placeholder="Groom Name"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />
                    <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          >
            <option value="WEDDING">Wedding</option>
            <option value="ENGAGEMENT">Engagement</option>
            <option value="RECEPTION">Reception</option>
            <option value="BIRTHDAY">Birthday</option>
            <option value="OTHER">Other</option>
          </select>

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-white/10 px-6 py-3 text-white transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreateEvent}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Event..." : "Create Event"}
          </button>

        </div>

      </div>
    </div>
  );
}