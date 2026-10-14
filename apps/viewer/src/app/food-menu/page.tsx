"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";
import MobileContainer from "../components/layout/MobileContainer";
import BottomNavigation from "../components/navigation/BottomNavigation";

interface FoodItem {
  id: string | number;
  name: string;
  category: string;
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
        let activeSlug = urlParams.get("event") || urlParams.get("slug");

        if (!activeSlug && typeof window !== "undefined") {
          activeSlug = localStorage.getItem("current_event_slug") || "testing-nns3";
        } else if (activeSlug) {
          localStorage.setItem("current_event_slug", activeSlug);
        }

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();

        let fetched = json?.event?.foodItems || json?.event?.customFields?.foodItems;

        while (typeof fetched === "string") {
          try {
            fetched = JSON.parse(fetched);
          } catch {
            break;
          }
        }

        if (Array.isArray(fetched) && fetched.length > 0) {
          setItems(fetched);
        }
      } catch (err) {
        console.error("Failed to load food menu:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const normalizeCat = (cat: string) => {
    const c = (cat || "").toUpperCase().replace(/[-\s]/g, "_");
    if (c.includes("NON")) return "NON_VEG";
    if (c.includes("VEG")) return "VEG";
    if (c.includes("DRINK") || c.includes("BEVERAGE")) return "DRINK";
    return c;
  };

  const filteredItems = items.filter((it) => {
    if (activeTab === "ALL") return true;
    return normalizeCat(it.category) === activeTab;
  });

  const dishesCount = items.length;
  const drinksCount = items.filter((i) => normalizeCat(i.category) === "DRINK").length;

  return (
    <MobileContainer>
      <main className="min-h-screen pb-28 text-gray-900 bg-gradient-to-b from-[#fdfbf7] to-[#fff6ee]">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-amber-100/60 bg-white/90 px-4 py-3.5 backdrop-blur-md">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-900 shadow-sm active:scale-95 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-amber-500 text-white rounded-full">
            FOOD & DRINKS MENU
          </span>
          <div className="w-10" />
        </div>

        <div className="p-4 space-y-4">
          {/* Feast Banner Card */}
          <div className="rounded-[30px] border border-amber-100 bg-white p-5 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <UtensilsCrossed size={22} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-4">Royal Feast</h2>
            <p className="text-xs text-gray-500 mt-1">
              Carefully crafted dishes and refreshing beverages prepared with love.
            </p>

            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="rounded-2xl border border-amber-100/80 bg-amber-50/40 p-2.5 text-center">
                <span className="text-lg font-extrabold text-amber-800">{dishesCount}</span>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">Total Items</p>
              </div>
              <div className="rounded-2xl border border-amber-100/80 bg-amber-50/40 p-2.5 text-center">
                <span className="text-lg font-extrabold text-amber-800">3</span>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">Categories</p>
              </div>
              <div className="rounded-2xl border border-amber-100/80 bg-amber-50/40 p-2.5 text-center">
                <span className="text-lg font-extrabold text-amber-800">{drinksCount}</span>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">Beverages</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: "ALL", label: "All Items" },
              { id: "VEG", label: "🌱 Veg" },
              { id: "NON_VEG", label: "🍗 Non-Veg" },
              { id: "DRINK", label: "🍹 Drinks" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-white text-gray-600 border border-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dish / Drink Items Feed */}
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading menu...</div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">No items in this category.</div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const norm = normalizeCat(item.category);
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3.5 shadow-sm flex gap-3.5 items-center"
                  >
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="h-20 w-20 rounded-2xl object-cover flex-shrink-0 bg-gray-100 border border-amber-100"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <UtensilsCrossed size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            norm === "VEG"
                              ? "bg-emerald-50 text-emerald-700"
                              : norm === "NON_VEG"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {norm}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mt-1 truncate">{item.name}</h4>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNavigation />
    </MobileContainer>
  );
}