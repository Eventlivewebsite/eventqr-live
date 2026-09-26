"use client";

import { useState, useEffect } from "react";
import FoodCategory from "./FoodCategory";
import { foodData, FoodItem } from "./food-data";

export default function FoodSection() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealAdminFood() {
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

        if (data?.success && Array.isArray(data?.event?.foodItems) && data.event.foodItems.length > 0) {
          const mapped: FoodItem[] = data.event.foodItems.map((item: any, idx: number) => {
            const rawCat = (item.category || "").toUpperCase();
            let catTitle = item.category || "Special Menu";
            
            if (rawCat === "VEG") catTitle = "Vegetarian Delights";
            else if (rawCat === "NON_VEG") catTitle = "Non-Vegetarian Specialties";
            else if (rawCat === "DRINK" || rawCat === "BEVERAGE") catTitle = "Welcome Drinks & Beverages";

            return {
              id: item.id || idx + 1,
              category: catTitle,
              name: item.name || "Special Item",
              description: item.description || "Prepared fresh for guests.",
              image: item.photoUrl || item.image || "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
              type: rawCat === "NON_VEG" ? "Non Veg" : "Veg",
              popular: true,
              chefSpecial: true,
              available: true,
              likes: 18,
              rating: 4.9,
              spicyLevel: 1,
            };
          });
          setItems(mapped);
        } else {
          setItems(foodData);
        }
      } catch (err) {
        setItems(foodData);
      } finally {
        setLoading(false);
      }
    }
    fetchRealAdminFood();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-amber-800">
        <p className="text-sm font-medium animate-pulse">Loading menu...</p>
      </div>
    );
  }

  const groupedFood = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  const categoryIcons: Record<string, string> = {
    "Vegetarian Delights": "🌱",
    "Non-Vegetarian Specialties": "🍗",
    "Welcome Drinks & Beverages": "🍹",
    "Welcome Drinks": "🍹",
    "Starters": "🥟",
    "Main Course": "🍲",
    "Indian Bread": "🫓",
    "Rice": "🍚",
    "Desserts": "🍨",
    "Ice Cream": "🍦",
    "Beverages": "☕",
  };

  return (
    <div id="food-categories-section" className="space-y-6 px-4 pb-24">
      {Object.entries(groupedFood).map(([category, list]) => (
        <FoodCategory
          key={category}
          title={category}
          icon={categoryIcons[category] || "🍽️"}
          foods={list}
          items={list}
        />
      ))}
    </div>
  );
}