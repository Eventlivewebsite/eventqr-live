"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChefHat, Sparkles } from "lucide-react";

type Props = {
  onBack: () => void;
};

export default function FoodHero({ onBack }: Props) {
  const [eventData, setEventData] = useState<{
    title: string;
    dishesCount: number;
    categoriesCount: number;
    primaryType: string;
  }>({
    title: "Feast",
    dishesCount: 0,
    categoriesCount: 0,
    primaryType: "Special",
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";

        // Try local viewer API first, fallback to Admin live public API on Vercel
        let res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
        let data = res ? await res.json().catch(() => null) : null;

        if (!data || !data.success) {
          res = await fetch(`https://eventqr-live-admin.vercel.app/api/public/event/${encodeURIComponent(activeSlug)}`, { cache: "no-store" }).catch(() => null);
          data = res ? await res.json().catch(() => null) : null;
        }

        if (data?.success && data?.event) {
          const items: any[] = Array.isArray(data.event.foodItems) ? data.event.foodItems : [];
          
          const categoriesSet = new Set(
            items.map((i: any) => (i.category || "General").trim().toUpperCase())
          );
          
          let hasDrink = false;
          let hasNonVeg = false;
          let hasVeg = false;

          items.forEach((i: any) => {
            const cat = (i.category || "").toUpperCase();
            if (cat.includes("DRINK") || cat.includes("BEVERAGE")) hasDrink = true;
            if (cat.includes("NON_VEG") || cat.includes("NON VEG")) hasNonVeg = true;
            if (cat.includes("VEG") && !cat.includes("NON")) hasVeg = true;
          });

          let totalCategories = categoriesSet.size;
          if (hasDrink && !Array.from(categoriesSet).some(c => c.includes("DRINK"))) {
            totalCategories += 1;
          }

          let tag = "Special";
          if (hasVeg && hasNonVeg) tag = "Veg / Non-Veg";
          else if (hasVeg) tag = "Veg";
          else if (hasNonVeg) tag = "Non-Veg";

          setEventData({
            title: data.event.title ? `${data.event.title} Feast` : "Celebration Feast",
            dishesCount: items.length,
            categoriesCount: totalCategories || items.length,
            primaryType: tag,
          });
        }
      } catch (e) {
        console.error("Hero load error:", e);
      }
    }
    loadStats();
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Luxury Background */}
      <div className="absolute inset-0">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-amber-300/20 blur-[90px]" />
        <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-orange-300/20 blur-[90px]" />
        <div className="absolute left-1/2 bottom-0 h-52 w-52 -translate-x-1/2 rounded-full bg-yellow-200/20 blur-[90px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6">
          <button
            onClick={onBack}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,.08)] transition-all duration-300 hover:-translate-y-1"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>

          <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
            FOOD MENU
          </span>
        </div>

        {/* Content Box */}
        <div className="mx-5 mt-6 rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_20px_50px_rgba(245,158,11,0.12)] backdrop-blur-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-[0_10px_25px_rgba(245,158,11,0.4)]">
            <ChefHat className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 capitalize">
            {eventData.title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Carefully crafted dishes prepared with love to make every guest feel special and every celebration unforgettable.
          </p>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3 text-center">
              <ChefHat className="mx-auto h-4 w-4 text-amber-600" />
              <p className="mt-1 text-xl font-black text-gray-900">{eventData.dishesCount}</p>
              <p className="text-[11px] font-medium text-gray-500">Dishes</p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-3 text-center">
              <Sparkles className="mx-auto h-4 w-4 text-orange-500" />
              <p className="mt-1 text-xl font-black text-gray-900">{eventData.categoriesCount}</p>
              <p className="text-[11px] font-medium text-gray-500">Categories</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
              <div className="mx-auto flex h-4 w-4 items-center justify-center text-xs">🌱</div>
              <p className="mt-1 text-sm font-black text-gray-900 truncate">{eventData.primaryType}</p>
              <p className="text-[11px] font-medium text-gray-500">Premium</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              const el = document.getElementById("food-categories-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 font-bold text-white shadow-[0_12px_30px_rgba(245,158,11,0.35)] transition-all hover:opacity-95"
          >
            🍽 Explore {eventData.title}
          </button>
        </div>
      </div>
    </section>
  );
}