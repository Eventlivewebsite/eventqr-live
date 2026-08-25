"use client";

import { ArrowLeft, Heart, Star, Users } from "lucide-react";

type Props = {
  onBack: () => void;
};

export default function GuestBookHero({ onBack }: Props) {
  return (
    <section className="relative overflow-hidden">

      {/* Background Glow */}

      <div className="absolute -top-24 -left-16 h-56 w-56 rounded-full bg-pink-200/30 blur-[90px]" />

      <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-amber-200/30 blur-[90px]" />

      {/* Header */}

      <div className="relative z-10 flex items-center justify-between px-5 pt-5">

        <button
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,.12)]"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          Guest Book
        </div>

      </div>

      {/* Hero Card */}

      <div className="relative z-10 px-5 pt-5">

        <div className="overflow-hidden rounded-[34px] border border-white/60 bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl">

          {/* Floating Decoration */}

          <div className="absolute right-10 top-8 text-pink-200 text-6xl font-bold opacity-30">
            ❤
          </div>

          <div className="absolute left-8 bottom-8 h-24 w-24 rounded-full bg-pink-100 blur-3xl opacity-60" />

          {/* Title */}

          <div className="relative">

            <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">
              PREMIUM WISHES
            </span>

            <h1 className="mt-4 text-4xl font-black leading-tight text-gray-900">
              Leave Your
              <br />
              Blessings ❤️
            </h1>

            <p className="mt-3 max-w-[260px] text-sm leading-6 text-gray-500">
              Every heartfelt message becomes a beautiful memory for the bride
              and groom.
            </p>

          </div>

          {/* Stats */}

          <div className="mt-8 grid grid-cols-3 gap-3">

            <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-white p-4 shadow-inner">

              <Heart
                size={20}
                className="mb-2 text-pink-500"
              />

              <h3 className="text-2xl font-bold">
                248
              </h3>

              <p className="text-xs text-gray-500">
                Wishes
              </p>

            </div>

            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white p-4 shadow-inner">

              <Star
                size={20}
                className="mb-2 fill-amber-400 text-amber-400"
              />

              <h3 className="text-2xl font-bold">
                4.9
              </h3>

              <p className="text-xs text-gray-500">
                Rating
              </p>

            </div>

            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-white p-4 shadow-inner">

              <Users
                size={20}
                className="mb-2 text-violet-500"
              />

              <h3 className="text-2xl font-bold">
                1200
              </h3>

              <p className="text-xs text-gray-500">
                Guests
              </p>

            </div>

          </div>

          {/* CTA */}

          <button
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 py-4 text-base font-semibold text-white shadow-[0_18px_35px_rgba(244,63,94,.35)] transition-all duration-300 hover:-translate-y-1"
          >
            ✍️ Write Your Blessing
          </button>

        </div>

      </div>

    </section>
  );
}