"use client";

import { useRouter } from "next/navigation";

import {
  X,
  Sparkles,
  Mail,
  Users,
  BookOpen,
  UtensilsCrossed,
  Settings,
} from "lucide-react";

import MenuItem from "./MenuItem";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MenuDrawer({
  open,
  onClose,
}: Props) {

  const router = useRouter();

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className={`absolute inset-0 z-40 bg-black/35 transition-all duration-300 ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      {/* Drawer */}

      <div
        className={`absolute top-3 right-3 z-50 w-[78%] max-w-[315px]
        overflow-hidden rounded-[30px]
        bg-white/95 backdrop-blur-2xl
        shadow-[0_25px_80px_rgba(0,0,0,.20)]
        transition-all duration-500
        ${
          open
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >

        {/* Header */}

        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white p-6">

          <div className="flex items-start justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Sparkles
                  size={22}
                  className="text-amber-600"
                />

                <h2 className="text-3xl font-bold">
                  Menu
                </h2>

              </div>

              <p className="mt-2 text-sm text-gray-500">
                Premium Wedding Experience
              </p>

            </div>

            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg transition hover:rotate-90"
            >
              <X size={22} />
            </button>

          </div>

        </div>

        {/* Menu */}

        <div className="space-y-4 p-5">

          <MenuItem
            icon={<Mail size={22} />}
            title="Premium Invitation"
            subtitle="View Invitation"
            onClick={() => {
              onClose();
              router.push("/invitation");
            }}
          />

          <MenuItem
            icon={<Users size={22} />}
            title="Family"
            subtitle="Bride & Groom Family"
            onClick={() => {
              onClose();
              router.push("/family");
            }}
          />

          <MenuItem
            icon={<BookOpen size={22} />}
            title="Guest Book"
            subtitle="Leave Your Wishes"
            onClick={() => {
              onClose();
              router.push("/guest-book");
            }}
          />

          <MenuItem
            icon={<UtensilsCrossed size={22} />}
            title="Food Menu"
            subtitle="Today's Special"
            onClick={() => {
              onClose();
              router.push("/food-menu");
            }}
          />

          <MenuItem
            icon={<Settings size={22} />}
            title="Settings"
            subtitle="Application Preferences"
            onClick={() => {
              onClose();
              router.push("/settings");
            }}
          />

        </div>

      </div>
    </>
  );
}