"use client";

import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  Mail,
  Users,
  BookOpen,
  UtensilsCrossed,
  Settings as SettingsIcon,
  ChevronRight
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MenuDrawer({ open, onClose }: Props) {
  const router = useRouter();

  if (!open) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Floating Card Drawer (Exact Screenshot UI) */}
      <div className="fixed top-6 right-4 left-4 z-50 mx-auto max-w-[370px] overflow-hidden rounded-[36px] bg-[#fbf9f4]/95 p-6 shadow-2xl backdrop-blur-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={22} className="text-[#c68936]" />
              <h2 className="text-3xl font-extrabold text-[#2a2a2a] tracking-tight">Menu</h2>
            </div>
            <p className="mt-1 text-xs text-[#8c827a] font-medium">
              Premium Wedding Experience
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 active:scale-95"
          >
            <X size={20} className="text-[#333]" />
          </button>
        </div>

        {/* Menu Items List */}
        <div className="space-y-3.5">
          
          {/* 1. Premium Invitation */}
          <div
            onClick={() => navigateTo("/invitation")}
            className="flex items-center justify-between p-3.5 rounded-[22px] bg-white border border-gray-100/80 shadow-sm cursor-pointer hover:bg-amber-50/40 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-13 w-13 p-3 rounded-2xl bg-[#fbf0dc] text-[#333] flex items-center justify-center">
                <Mail size={22} className="text-[#3a352f]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1f1f1f]">Premium Invitation</h4>
                <p className="text-xs text-[#8c827a] mt-0.5">View Invitation</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#b5aaa0]" />
          </div>

          {/* 2. Family */}
          <div
            onClick={() => navigateTo("/family")}
            className="flex items-center justify-between p-3.5 rounded-[22px] bg-white border border-gray-100/80 shadow-sm cursor-pointer hover:bg-amber-50/40 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-13 w-13 p-3 rounded-2xl bg-[#fbf0dc] text-[#333] flex items-center justify-center">
                <Users size={22} className="text-[#3a352f]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1f1f1f]">Family</h4>
                <p className="text-xs text-[#8c827a] mt-0.5">Bride & Groom Family</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#b5aaa0]" />
          </div>

          {/* 3. Guest Book */}
          <div
            onClick={() => navigateTo("/guest-book")}
            className="flex items-center justify-between p-3.5 rounded-[22px] bg-white border border-gray-100/80 shadow-sm cursor-pointer hover:bg-amber-50/40 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-13 w-13 p-3 rounded-2xl bg-[#fbf0dc] text-[#333] flex items-center justify-center">
                <BookOpen size={22} className="text-[#3a352f]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1f1f1f]">Guest Book</h4>
                <p className="text-xs text-[#8c827a] mt-0.5">Leave Your Wishes</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#b5aaa0]" />
          </div>

          {/* 4. Food Menu */}
          <div
            onClick={() => navigateTo("/food-menu")}
            className="flex items-center justify-between p-3.5 rounded-[22px] bg-white border border-gray-100/80 shadow-sm cursor-pointer hover:bg-amber-50/40 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-13 w-13 p-3 rounded-2xl bg-[#fbf0dc] text-[#333] flex items-center justify-center">
                <UtensilsCrossed size={22} className="text-[#3a352f]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1f1f1f]">Food Menu</h4>
                <p className="text-xs text-[#8c827a] mt-0.5">Today's Special</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#b5aaa0]" />
          </div>

          {/* 5. Settings */}
          <div
            onClick={() => navigateTo("/login")}
            className="flex items-center justify-between p-3.5 rounded-[22px] bg-white border border-gray-100/80 shadow-sm cursor-pointer hover:bg-amber-50/40 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-13 w-13 p-3 rounded-2xl bg-[#fbf0dc] text-[#333] flex items-center justify-center">
                <SettingsIcon size={22} className="text-[#3a352f]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1f1f1f]">Settings</h4>
                <p className="text-xs text-[#8c827a] mt-0.5">Application Preferences</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#b5aaa0]" />
          </div>

        </div>

      </div>
    </>
  );
}