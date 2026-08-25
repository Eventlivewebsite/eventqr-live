"use client";

import {
  ArrowLeft,
  HeartHandshake,
} from "lucide-react";

type Props = {
  onBack: () => void;
};

export default function FamilyHero({
  onBack,
}: Props) {
  return (
    <section className="relative overflow-hidden">

      {/* Background Blur */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-rose-300/20 blur-3xl" />

        <div className="absolute left-1/2 top-20 h-40 w-40 -translate-x-1/2 rounded-full bg-orange-200/20 blur-3xl" />

      </div>

      <div className="relative z-10">

        {/* Top */}

        <div className="flex items-center justify-between px-5 pt-6">

          {/* Back */}

          <button
            onClick={onBack}
            className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-[0_15px_40px_rgba(0,0,0,.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,.15)]"
          >
            <ArrowLeft
              size={20}
              className="transition group-hover:-translate-x-1"
            />
          </button>

          {/* Badge */}

          <div className="rounded-full border border-amber-200 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-xl">

            <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-sm font-bold text-transparent">

              FAMILY

            </span>

          </div>

        </div>

        {/* Hero */}

        <div className="px-5 pb-10 pt-8">

          <div className="rounded-[34px] border border-white/70 bg-white/70 p-7 shadow-[0_25px_70px_rgba(0,0,0,.08)] backdrop-blur-2xl">

            {/* Icon */}

            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white shadow-[0_15px_35px_rgba(255,170,90,.35)]">

              <HeartHandshake size={36} />

            </div>

            {/* Title */}

            <h1 className="mt-6 text-3xl font-black leading-tight text-gray-900">

              Meet Our
              <br />

              Beautiful Family

            </h1>

            {/* Subtitle */}

            <p className="mt-4 leading-7 text-gray-600">

              Every celebration becomes memorable because of the people who stand beside us with love, blessings and happiness.

            </p>

            {/* Bottom Stats */}

            <div className="mt-8 grid grid-cols-3 gap-4">

              <div className="rounded-2xl bg-gradient-to-br from-[#fff7eb] to-[#fff2df] p-4 text-center">

                <p className="text-2xl font-black text-amber-600">

                  24

                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">

                  Members

                </p>

              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[#fff1f1] to-[#ffe4e4] p-4 text-center">

                <p className="text-2xl font-black text-rose-500">

                  2

                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">

                  Families

                </p>

              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[#eefaf5] to-[#e1f8ee] p-4 text-center">

                <p className="text-2xl font-black text-green-600">

                  ❤

                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">

                  Together

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}