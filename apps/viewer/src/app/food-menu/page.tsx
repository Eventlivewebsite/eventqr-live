"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, UtensilsCrossed, Wine, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import MobileContainer from "../components/layout/MobileContainer";

export default function FoodMenuPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "VEG" | "NON_VEG" | "DRINK">("ALL");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activeSlug = urlParams.get("event") || urlParams.get("slug");

        if (!activeSlug) {
          setItems([
            { id: 1, name: "Paneer Tikka Royale", category: "VEG", description: "Charcoal grilled cottage cheese with aromatic spices", photoUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500" },
            { id: 2, name: "Dal Makhani Grandeur", category: "VEG", description: "Slow cooked black lentils with churned butter", photoUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500" },
            { id: 3, name: "Mutton Rogan Josh", category: "NON_VEG", description: "Kashmiri delicacy cooked with tender meat & spices", photoUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500" },
            { id: 4, name: "Royal Blue Lagoon", category: "DRINK", description: "Refreshing blue curacao mocktail with citrus notes", photoUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500" }
          ]);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();

        let rawList: any[] = [];
        if (json?.success && json?.event) {
          const ev = json.event;
          if (Array.isArray(ev.foodItems) && ev.foodItems.length > 0) {
            rawList = ev.foodItems;
          } else if (ev.customMap?.foodItems) {
            rawList = Array.isArray(ev.customMap.foodItems) ? ev.customMap.foodItems : [];
          }
        }

        if (rawList.length > 0) {
          const mapped = rawList.map((it: any, idx: number) => {
            let cat: "VEG" | "NON_VEG" | "DRINK" = "VEG";
            const rawType = String(it.type || it.dishType || it.category || "").toUpperCase();
            if (rawType.includes("NON") || rawType.includes("MEAT")) {
              cat = "NON_VEG";
            } else if (rawType.includes("DRINK") || rawType.includes("BEVERAGE")) {
              cat = "DRINK";
            } else {
              cat = "VEG";
            }

            return {
              id: it.id || idx + 1,
              name: it.dishName || it.name || it.title || "Special Item",
              category: cat,
              description: it.description || it.desc || "",
              photoUrl: it.photoUrl || it.image || it.photo || ""
            };
          });
          setItems(mapped);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Failed to load menu", err);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  const filteredItems = items.filter(it => {
    if (activeTab === "ALL") return true;
    return it.category === activeTab;
  });

  const vegCount = items.filter(it => it.category === "VEG").length;
  const nonVegCount = items.filter(it => it.category === "NON_VEG").length;
  const drinkCount = items.filter(it => it.category === "DRINK").length;

  return (
    <MobileContainer>
      <div className="min-h-screen bg-stone-50 pb-20">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/80 bg-white/80 px-4 py-3 backdrop-blur-md">
          <button 
            onClick={() => router.back()} 
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition hover:bg-stone-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            Food & Drinks Menu
          </div>
          <div className="w-9" />
        </header>

        <main className="p-4 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-600 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Gourmet Selection
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
              Royal Feast
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Carefully crafted dishes and refreshing beverages prepared with love to make every guest feel special.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-stone-100 pt-3">
              <div className="rounded-xl bg-amber-50/50 p-2 text-center">
                <p className="text-lg font-bold text-amber-700">{items.length}</p>
                <p className="text-[10px] font-medium text-stone-500 uppercase">Total Items</p>
              </div>
              <div className="rounded-xl bg-emerald-50/50 p-2 text-center">
                <p className="text-lg font-bold text-emerald-700">{vegCount + nonVegCount}</p>
                <p className="text-[10px] font-medium text-stone-500 uppercase">Categories</p>
              </div>
              <div className="rounded-xl bg-blue-50/50 p-2 text-center">
                <p className="text-lg font-bold text-blue-700">{drinkCount}</p>
                <p className="text-[10px] font-medium text-stone-500 uppercase">Beverages</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab("VEG")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                activeTab === "VEG"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              ?? Veg
            </button>
            <button
              onClick={() => setActiveTab("NON_VEG")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                activeTab === "NON_VEG"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              ?? Non-Veg
            </button>
            <button
              onClick={() => setActiveTab("DRINK")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                activeTab === "DRINK"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              ?? Drinks
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
                Loading menu items...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
                No items found for this selection.
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition hover:shadow-md"
                >
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      {item.category === "DRINK" ? <Wine className="h-8 w-8" /> : <UtensilsCrossed className="h-8 w-8" />}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            item.category === "VEG"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.category === "NON_VEG"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.category === "VEG" ? "VEG" : item.category === "NON_VEG" ? "NON_VEG" : "DRINK"}
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-stone-900 leading-snug">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-stone-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </MobileContainer>
  );
}
