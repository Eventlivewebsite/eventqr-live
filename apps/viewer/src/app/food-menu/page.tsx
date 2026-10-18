"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChefHat } from "lucide-react";
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

        if (!activeSlug && typeof window !== "undefined") {
          activeSlug = localStorage.getItem("eventqr_active_slug") || "wasim";
        }

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();

        if (json?.success && json?.event) {
          if (json.event.slug) {
            localStorage.setItem("eventqr_active_slug", json.event.slug);
          }

          let rawFood = json.event.foodItems;
          while (typeof rawFood === "string") {
            try {
              rawFood = JSON.parse(rawFood);
            } catch {
              break;
            }
          }

          if (Array.isArray(rawFood)) {
            setItems(rawFood);
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
    const cat = (it.category || "").toUpperCase();
    return cat === activeTab;
  });

  const dishesCount = items.filter((i) => (i.category || "").toUpperCase() !== "DRINK").length;
  const drinksCount = items.filter((i) => (i.category || "").toUpperCase() === "DRINK").length;

  return (
    <MobileContainer>
      <main className="min-h-screen pb-28 text-gray-900 bg-[#FFFDF9]">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-gray-900">Grand Feast Menu</h1>
            <p className="text-[10px] text-amber-700 font-semibold tracking-wider uppercase">Culinary Experience</p>
          </div>
          <div className="w-7" />
        </header>

        {/* Top Metric Cards */}
        <div className="mx-4 mt-4 grid grid-cols-3 gap-2 border border-amber-200/70 rounded-2xl bg-white p-3 shadow-sm text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-none">{items.length}</div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mt-1">Total Items</div>
          </div>
          <div className="border-x border-amber-100">
            <div className="text-2xl font-bold text-emerald-600 leading-none">{dishesCount}</div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mt-1">Gourmet Dishes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600 leading-none">{drinksCount}</div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mt-1">Drinks & Sips</div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mx-4 mt-4 border border-amber-200/70 rounded-2xl bg-amber-50/40 p-1 flex gap-1">
          {[
            { key: "ALL", label: "All Feast" },
            { key: "VEG", label: "Vegetarian" },
            { key: "NON_VEG", label: "Non-Veg" },
            { key: "DRINK", label: "Drinks & Sips" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                activeTab === t.key
                  ? "bg-white text-gray-900 shadow-sm border border-amber-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content List */}
        <div className="px-4 mt-4">
          {loading ? (
            <div className="py-20 text-center text-xs text-gray-400">Loading menu...</div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-amber-200 rounded-3xl bg-white p-6">
              <ChefHat className="w-10 h-10 mx-auto text-amber-400 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-gray-800">No menu items published yet</p>
              <p className="text-xs text-gray-500 mt-1">Dishes added from the host admin panel will appear live here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm flex items-center gap-3"
                >
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs shrink-0">
                      Food
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 truncate">{item.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          (item.category || "").toUpperCase() === "VEG"
                            ? "bg-emerald-100 text-emerald-800"
                            : (item.category || "").toUpperCase() === "NON_VEG"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
