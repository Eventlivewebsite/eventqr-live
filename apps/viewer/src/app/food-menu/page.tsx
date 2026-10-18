"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, UtensilsCrossed, Wine, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import MobileContainer from "../components/layout/MobileContainer";
import BottomNavigation from "../components/navigation/BottomNavigation";

export default function FoodMenuPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "VEG" | "NON_VEG" | "DRINK">("ALL");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        
        // Auto-read saved slug if empty
        if (!activeSlug && typeof window !== "undefined") {
          activeSlug = localStorage.getItem("eventqr_active_slug") || "";
        }

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();
        
        if (json?.success && json?.event) {
          if (json.event.slug) {
            localStorage.setItem("eventqr_active_slug", json.event.slug);
          }
          
          let foodList = json.event.foodItems;
          if (typeof foodList === "string") {
            try { foodList = JSON.parse(foodList); } catch {}
          }
          
          if (Array.isArray(foodList) && foodList.length > 0) {
            setItems(foodList);
          } else {
            setItems([]);
          }
        }
      } catch (e) {
        console.error("Food menu fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const filteredItems = items.filter((it) => {
    if (activeTab === "ALL") return true;
    return it.category === activeTab;
  });

  const dishesCount = items.filter((i) => i.category !== "DRINK").length;
  const drinksCount = items.filter((i) => i.category === "DRINK").length;

  return (
    <MobileContainer>
      <main className="min-h-screen pb-28 text-gray-900 bg-gradient-to-b from-[#fdfbf7] to-[#fff6ee]">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#f3e8d8] px-4 py-3.5 flex items-center justify-between shadow-sm">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-amber-50 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-serif font-bold text-gray-900 tracking-wide">Grand Feast Menu</h1>
            <p className="text-[11px] text-[#B68D40] font-medium tracking-widest uppercase">Culinary Experience</p>
          </div>
          <div className="w-8" />
        </header>

        {/* Counter Summary Cards (Original Golden Ratio Style) */}
        <div className="p-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl p-3 border text-center shadow-sm bg-white border-[#f3e8d8]">
            <span className="block text-2xl font-black text-gray-900">{items.length}</span>
            <span className="text-[10px] tracking-wider text-gray-400 font-bold uppercase">Total Items</span>
          </div>

          <div className="rounded-2xl p-3 border text-center shadow-sm bg-white border-[#f3e8d8]">
            <span className="block text-2xl font-black text-[#10b981]">{dishesCount}</span>
            <span className="text-[10px] tracking-wider text-gray-400 font-bold uppercase">Gourmet Dishes</span>
          </div>

          <div className="rounded-2xl p-3 border text-center shadow-sm bg-white border-[#f3e8d8]">
            <span className="block text-2xl font-black text-[#d97706]">{drinksCount}</span>
            <span className="text-[10px] tracking-wider text-gray-400 font-bold uppercase">Drinks & Sips</span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "ALL", label: "All Feast" },
              { id: "VEG", label: "Vegetarian" },
              { id: "NON_VEG", label: "Non-Veg" },
              { id: "DRINK", label: "Drinks & Sips" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 rounded-full text-xs font-bold transition whitespace-nowrap shadow-sm border ${
                  activeTab === tab.id
                    ? "bg-[#B68D40] text-white border-[#B68D40]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food Items Original Card Grid */}
        <div className="p-4 space-y-3.5">
          {loading ? (
            <div className="py-20 text-center text-gray-400 text-xs">
              <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-[#B68D40]" />
              Preparing live menu...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-[#e6d5bc] p-6">
              <UtensilsCrossed className="w-10 h-10 mx-auto text-[#B68D40] mb-2 stroke-[1.5]" />
              <p className="text-sm font-bold text-gray-800">No dishes in this category</p>
              <p className="text-xs text-gray-500 mt-1">Please select another tab to view items.</p>
            </div>
          ) : (
            filteredItems.map((item: any, idx: number) => {
              const isDrink = item.category === "DRINK";
              const isVeg = item.category === "VEG";
              const isNonVeg = item.category === "NON_VEG";

              return (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-2xl p-3 border border-[#f3e8d8] shadow-sm flex gap-3.5 items-center hover:shadow-md transition"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0 border border-[#f3e8d8]">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#B68D40]">
                        {isDrink ? <Wine className="w-8 h-8" /> : <UtensilsCrossed className="w-8 h-8" />}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {/* Diet Badge */}
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wide ${
                          isVeg
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isNonVeg
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {isVeg ? "VEG" : isNonVeg ? "NON-VEG" : "BEVERAGE"}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 truncate capitalize">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-snug">
                      {item.description || "Prepared with authentic ingredients"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
