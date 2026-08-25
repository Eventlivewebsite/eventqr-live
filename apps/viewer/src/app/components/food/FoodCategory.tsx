"use client";

import FoodCard from "./FoodCard";

type Food = {
  id: number;
  name: string;
  description: string;
  image: string;
  type: "Veg" | "Non Veg";
  popular: boolean;
  chefSpecial: boolean;
  available: boolean;
  likes: number;
};

type Props = {
  title: string;
  emoji: string;
  foods: Food[];
};

export default function FoodCategory({
  title,
  emoji,
  foods,
}: Props) {
  return (
    <section className="mb-12">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-black text-gray-900">
            <span className="text-3xl">{emoji}</span>
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {foods.length} Delicious Items
          </p>

        </div>

        <div
          className="
            rounded-full
            bg-gradient-to-r
            from-orange-500
            via-amber-500
            to-yellow-400
            px-4
            py-2
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-white
            shadow-lg
          "
        >
          Premium
        </div>

      </div>

      {/* Cards */}

      <div className="space-y-6">

        {foods.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
          />
        ))}

      </div>

    </section>
  );
}