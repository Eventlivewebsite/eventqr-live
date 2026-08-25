"use client";

import {
  ChefHat,
  Flame,
  Leaf,
  Star,
} from "lucide-react";
import LikeButton from "../ui/LikeButton";
type Props = {
 food: {
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
};

export default function FoodCard({
  food,
}: Props) {
  return (
    <div
      className="group relative overflow-hidden rounded-[32px]
      border border-white/70
      bg-white
      shadow-[0_18px_55px_rgba(0,0,0,.08)]
      transition-all duration-500
      hover:-translate-y-2
      hover:shadow-[0_28px_70px_rgba(0,0,0,.15)]"
    >

      {/* Premium Glow */}

      <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-amber-200/20 blur-3xl" />

      <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-orange-200/20 blur-3xl" />

      {/* Image */}

      <div className="relative h-60 overflow-hidden">

        <img
          src={food.image}
          alt={food.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
<div className="absolute bottom-4 left-4 z-20">
  <LikeButton
    initialLikes={food.likes}
  />
</div>
        {/* Veg Badge */}

        <div className="absolute left-4 top-4">

          {food.type === "Veg" ? (
            <div className="flex items-center gap-2 rounded-full bg-green-500 px-3 py-2 text-xs font-semibold text-white shadow-lg">

              <Leaf size={14} />

              Veg

            </div>
          ) : (
            <div className="rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-lg">

              Non Veg

            </div>
          )}

        </div>

        {/* Popular */}

        {food.popular && (

          <div className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-lg">

            ⭐ Popular

          </div>

        )}

      </div>

      {/* Content */}

      <div className="p-6">

        <div className="flex items-center justify-between">

          <h3 className="text-xl font-black text-gray-900">

            {food.name}

          </h3>

          {food.chefSpecial && (

            <ChefHat
              size={22}
              className="text-orange-500"
            />

          )}

        </div>

        <p className="mt-3 leading-7 text-gray-600">

          {food.description}

        </p>

        {/* Bottom */}

        <div className="mt-6 flex items-center justify-between">

          <div className="flex items-center gap-1">

            {Array.from({ length: 5 }).map((_, index) => (

              <Star
                key={index}
                size={16}
                className="fill-amber-400 text-amber-400"
              />

            ))}

          </div>

          <div className="rounded-full bg-orange-50 px-4 py-2">

            <span className="flex items-center gap-2 text-sm font-semibold text-orange-600">

              <Flame size={16} />

              Chef Choice

            </span>

          </div>

        </div>

        {/* Availability */}

        <div className="mt-6">

          {food.available ? (

            <div className="rounded-2xl bg-green-50 py-3 text-center text-sm font-semibold text-green-700">

              ✅ Available

            </div>

          ) : (

            <div className="rounded-2xl bg-red-50 py-3 text-center text-sm font-semibold text-red-700">

              ❌ Not Available

            </div>

          )}

        </div>

      </div>

    </div>
  );
}