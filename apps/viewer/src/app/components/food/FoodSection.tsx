"use client";

import FoodCategory from "./FoodCategory";
import { foodData } from "./food-data";

export default function FoodSection() {

  // Group Food By Category

  const groupedFood = foodData.reduce((acc, item) => {

    if (!acc[item.category]) {
      acc[item.category] = [];
    }

    acc[item.category].push(item);

    return acc;

  }, {} as Record<string, typeof foodData>);

  // Category Icons

  const categoryIcons: Record<string, string> = {

    "Welcome Drinks": "🥤",

    "Starters": "🥗",

    "Main Course": "🍛",

    "Indian Bread": "🥖",

    "Rice": "🍚",

    "Desserts": "🍰",

    "Ice Cream": "🍨",

    "Beverages": "☕",

  };

  return (

    <section className="mt-8 space-y-12 px-5 pb-20">

      {Object.entries(groupedFood).map(([category, foods]) => (

        <FoodCategory
          key={category}
          title={category}
          emoji={categoryIcons[category] ?? "🍽️"}
          foods={foods}
        />

      ))}

      {/* Footer */}

      <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8 text-center shadow-[0_15px_45px_rgba(0,0,0,.06)]">

        <div className="text-5xl">
          🍽️
        </div>

        <h2 className="mt-5 text-3xl font-black text-gray-900">
          Enjoy Your Meal
        </h2>

        <p className="mx-auto mt-4 max-w-md leading-7 text-gray-600">

          Every dish has been prepared with love and served with warmth.
          We hope this celebration becomes unforgettable for you and
          your family.

        </p>

        <div className="mt-8 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg">

          ❤️ Made With Love For Our Guests

        </div>

      </div>

    </section>

  );
}