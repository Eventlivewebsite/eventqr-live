"use client";

import {
  ArrowLeft,
  UtensilsCrossed,
  ChefHat,
  Sparkles,
} from "lucide-react";

type Props = {
  onBack: () => void;
};

export default function FoodHero({
  onBack,
}: Props) {
  return (
    <section className="relative overflow-hidden">

      {/* Luxury Background */}

      <div className="absolute inset-0">

        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-amber-300/20 blur-[90px]" />

        <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-orange-300/20 blur-[90px]" />

        <div className="absolute left-1/2 bottom-0 h-52 w-52 -translate-x-1/2 rounded-full bg-yellow-200/20 blur-[90px]" />

      </div>

      <div className="relative z-10">

        {/* Header */}

        <div className="flex items-center justify-between px-5 pt-6">

          <button
            onClick={onBack}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,.08)] transition-all duration-300 hover:-translate-y-1"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            FOOD MENU
          </div>

        </div>

        {/* Hero Card */}

        <div className="px-5 pb-10 pt-6">

          <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-7 shadow-[0_25px_70px_rgba(0,0,0,.08)] backdrop-blur-2xl">

            {/* Decoration */}

            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-amber-200/30 blur-3xl" />

            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-orange-200/30 blur-3xl" />

            {/* Icon */}

            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 text-white shadow-[0_15px_35px_rgba(255,170,70,.35)]">

              <UtensilsCrossed size={36} />

            </div>

            {/* Title */}

            <h1 className="mt-6 text-4xl font-black leading-tight text-gray-900">

              Wedding
              <br />

              Feast

            </h1>

            <p className="mt-4 max-w-[280px] leading-7 text-gray-600">

              Carefully crafted dishes prepared with love to make
              every guest feel special and every celebration unforgettable.

            </p>

            {/* Stats */}

            <div className="mt-8 grid grid-cols-3 gap-4">

              <div className="rounded-2xl bg-gradient-to-br from-[#fff8eb] to-[#fff3df] p-4 text-center">

                <ChefHat
                  size={22}
                  className="mx-auto mb-2 text-orange-500"
                />

                <h3 className="text-2xl font-black text-gray-900">
                  42
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Dishes
                </p>

              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[#fff6ef] to-[#fff1e4] p-4 text-center">

                <Sparkles
                  size={22}
                  className="mx-auto mb-2 text-amber-500"
                />

                <h3 className="text-2xl font-black text-gray-900">
                  8
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Categories
                </p>

              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[#eefaf5] to-[#e4f9ef] p-4 text-center">

                <span className="text-2xl">
                  🌿
                </span>

                <h3 className="mt-2 text-2xl font-black text-gray-900">
                  Veg
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Premium
                </p>

              </div>

            </div>

            {/* CTA */}

            <button className="mt-8 w-full rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 py-4 font-semibold text-white shadow-[0_18px_40px_rgba(255,160,60,.35)] transition-all duration-300 hover:-translate-y-1">

              🍽 Explore Wedding Menu

            </button>

          </div>

        </div>

      </div>

    </section>
  );
}