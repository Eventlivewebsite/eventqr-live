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
        const activeSlug = urlParams.get("event") || urlParams.get("slug") || "testing-nns3";
        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(activeSlug)}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && Array.isArray(json?.event?.foodItems) && json.event.foodItems.length > 0) {
          setItems(json.event.foodItems);
        } else {
          setItems([
            { id: 1, name: "Paneer Tikka Royale", category: "VEG", description: "Charcoal grilled cottage cheese with aromatic spices", photoUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500" },
            { id: 2, name: "Dal Makhani Grandeur", category: "VEG", description: "Slow cooked black lentils with churned butter", photoUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500" },
            { id: 3, name: "Mutton Rogan Josh", category: "NON_VEG", description: "Kashmiri delicacy cooked with tender meat & spices", photoUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500" },
            { id: 4, name: "Royal Blue Lagoon", category: "DRINK", description: "Refreshing blue curaçao mocktail with citrus notes", photoUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500" },
            { id: 5, name: "Signature Virgin Mojito", category: "DRINK", description: "Crushed mint, fresh lime and sparkling fizz", photoUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500" }
          ]);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const filteredItems = items.filter(it => {
    if (activeTab === "ALL") return true;
    return it.category === activeTab;
  });

  const dishesCount = items.length;
  const drinksCount = items.filter(i => i.category === "DRINK").length;

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
          <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[11px] font-bold uppercase text-white shadow-sm">
            FOOD & DRINKS MENU
          </span>
          <div className="h-10 w-10" />
        </div>

        <div className="p-4 space-y-4">
          {/* Feast Card */}
          <div className="rounded-[30px] border border-amber-100 bg-white p-5 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <UtensilsCrossed size={22} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-4">Royal Feast</h2>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Carefully crafted dishes and refreshing beverages prepared with love to make every guest feel special.
            </p>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="rounded-2xl border border-amber-100/80 bg-amber-50/40 p-2.5 text-center">
                <span className="text-lg font-extrabold text-amber-800">{dishesCount}</span>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">Total Items</p>
              </div>
              <div className="rounded-2xl border border-amber-100/80 bg-amber-50/40 p-2.5 text-center">
                <span className="text-lg font-extrabold text-amber-800">3</span>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">Categories</p>
              </div>
              <div className="rounded-2xl border border-amber-100/80 bg-emerald-50/50 p-2.5 text-center">
                <span className="text-lg font-extrabold text-emerald-700">{drinksCount}</span>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">Beverages</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "ALL", label: "All Items" },
              { id: "VEG", label: "🌱 Veg" },
              { id: "NON_VEG", label: "🍗 Non-Veg" },
              { id: "DRINK", label: "🍹 Drinks" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-white text-gray-600 border border-amber-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dish / Drink Items Feed */}
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3.5 shadow-sm flex gap-3.5 items-center"
              >
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="h-20 w-20 rounded-2xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <UtensilsCrossed size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.category === "VEG" ? "bg-emerald-50 text-emerald-700" :
                      item.category === "NON_VEG" ? "bg-rose-50 text-rose-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mt-1 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNavigation />
      </main>
    </MobileContainer>
  );
}