"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, UtensilsCrossed, Wine, Sparkles, ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";
import MobileContainer from "../components/layout/MobileContainer";
import BottomNavigation from "../components/navigation/BottomNavigation";

interface FoodItem {
  id: string | number;
  name: string;
  category: "VEG" | "NON_VEG" | "DRINK";
  description?: string;
  photoUrl?: string;
}

export default function FoodMenuPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "VEG" | "NON_VEG" | "DRINK">("ALL");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();
        
        if (json?.success && Array.isArray(json?.event?.foodItems)) {
          setItems(json.event.foodItems);
        } else {
          setItems([]);
        }
      } catch (e) {
        console.error("Failed to load food menu:", e);
        setItems([]);
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
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-amber-100 px-4 py-3.5 flex items-center justify-between shadow-sm">
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

        {/* Counter Summary Card */}
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-white border border-amber-100 shadow-sm flex items-center justify-around text-center">
          <div>
            <span className="block text-xl font-bold text-gray-900">{items.length}</span>
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Total Items</span>
          </div>
          <div className="h-8 w-px bg-amber-100" />
          <div>
            <span className="block text-xl font-bold text-emerald-600">{dishesCount}</span>
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Gourmet Dishes</span>
          </div>
          <div className="h-8 w-px bg-amber-100" />
          <div>
            <span className="block text-xl font-bold text-amber-600">{drinksCount}</span>
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Drinks & Sips</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 mt-4">
          <div className="flex gap-2 p-1.5 bg-amber-50/80 rounded-2xl border border-amber-100 overflow-x-auto no-scrollbar">
            {(["ALL", "VEG", "NON_VEG", "DRINK"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm border border-amber-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "ALL" && "All Feast"}
                {tab === "VEG" && "Vegetarian"}
                {tab === "NON_VEG" && "Non-Veg"}
                {tab === "DRINK" && "Drinks & Sips"}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="px-4 mt-4 space-y-3.5">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              Loading delicious menu...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-amber-200 p-6">
              <ChefHat className="w-10 h-10 mx-auto text-amber-400 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-gray-800">No menu items published yet</p>
              <p className="text-xs text-gray-500 mt-1">Dishes added from the host admin panel will appear live here.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-amber-100 shadow-sm flex items-start gap-3.5 hover:shadow-md transition"
              >
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-amber-100 flex-shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-amber-500">
                    {item.category === "DRINK" ? <Wine className="w-8 h-8" /> : <UtensilsCrossed className="w-8 h-8" />}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                        item.category === "VEG"
                          ? "bg-emerald-500 ring-2 ring-emerald-200"
                          : item.category === "NON_VEG"
                          ? "bg-rose-500 ring-2 ring-rose-200"
                          : "bg-blue-500 ring-2 ring-blue-200"
                      }`}
                    />
                    <h3 className="text-sm font-bold text-gray-900 truncate">{item.name}</h3>
                  </div>

                  <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                    {item.description || "Freshly curated for this special occasion."}
                  </p>

                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      item.category === "VEG"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.category === "NON_VEG"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {item.category === "VEG" ? "Veg" : item.category === "NON_VEG" ? "Non-Veg" : "Drink"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
