"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  Mail,
  Users,
  BookOpen,
  UtensilsCrossed,
  Film,
  Camera
} from "lucide-react";

import MenuItem from "./MenuItem";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MenuDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const [eventTitle, setEventTitle] = useState("Celebration");
  const [modules, setModules] = useState({
    invitation: true,
    family: true,
    guestbook: true,
    foodMenu: true,
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        const json = res ? await res.json().catch(() => null) : null;
        if (json?.success && json?.event) {
          if (json.event.title) setEventTitle(json.event.title);
          if (json.event.enabledModules) setModules(json.event.enabledModules);
        }
      } catch {}
    }
    loadConfig();
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 z-40 bg-black/35 transition-all duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Drawer */}
      <div
        className={`absolute top-3 right-3 z-50 w-[78%] max-w-[315px]
        overflow-hidden rounded-[30px]
        bg-white/95 backdrop-blur-2xl
        shadow-[0_25px_80px_rgba(0,0,0,.20)]
        transition-all duration-500
        ${open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={22} className="text-amber-600" />
                <h2 className="text-2xl font-bold">Menu</h2>
              </div>
              <p className="mt-1 text-xs text-gray-500 line-clamp-1">{eventTitle}</p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow transition hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3 p-4">
          <MenuItem
            icon={<Camera size={20} />}
            title="Photos Gallery"
            subtitle="Moments & Memories"
            onClick={() => {
              onClose();
              router.push("/gallery");
            }}
          />

          <MenuItem
            icon={<Film size={20} />}
            title="Videos & Reels"
            subtitle="Highlights & Clips"
            onClick={() => {
              onClose();
              router.push("/videos");
            }}
          />

          {modules.invitation && (
            <MenuItem
              icon={<Mail size={20} />}
              title="Invitation"
              subtitle="View Invitation Card"
              onClick={() => {
                onClose();
                router.push("/invitation");
              }}
            />
          )}

          {modules.family && (
            <MenuItem
              icon={<Users size={20} />}
              title="Family"
              subtitle="Meet the Family"
              onClick={() => {
                onClose();
                router.push("/family");
              }}
            />
          )}

          {modules.foodMenu && (
            <MenuItem
              icon={<UtensilsCrossed size={20} />}
              title="Food Menu"
              subtitle="Dishes & Beverages"
              onClick={() => {
                onClose();
                router.push("/food-menu");
              }}
            />
          )}

          {modules.guestbook && (
            <MenuItem
              icon={<BookOpen size={20} />}
              title="Guest Book"
              subtitle="Wishes & Messages"
              onClick={() => {
                onClose();
                router.push("/guest-book");
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}