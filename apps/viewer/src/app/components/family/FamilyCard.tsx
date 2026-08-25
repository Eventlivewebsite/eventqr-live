"use client";

import { Heart, Users } from "lucide-react";

type Member = {
  id: number;
  name: string;
  relation: string;
  image: string;
};

type Props = {
  member: Member;
};

export default function FamilyCard({
  member,
}: Props) {
  return (
    <div className="group relative overflow-hidden rounded-[34px] border border-white/70 bg-white shadow-[0_18px_55px_rgba(0,0,0,.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(0,0,0,.15)]">

      {/* Background Glow */}

      <div className="absolute -left-20 -top-20 h-44 w-44 rounded-full bg-amber-200/20 blur-3xl" />

      <div className="absolute -right-20 bottom-0 h-44 w-44 rounded-full bg-rose-200/20 blur-3xl" />

      {/* Image */}

      <div className="relative h-[280px] overflow-hidden">

        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        {/* Dark Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Relation Badge */}

        <div className="absolute left-5 top-5 rounded-full border border-white/40 bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xl">

          {member.relation}

        </div>

        {/* Heart */}

        <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white backdrop-blur-xl">

          <Heart size={18} />

        </div>

      </div>

      {/* Content */}

      <div className="relative p-6">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white shadow-lg">

            <Users size={22} />

          </div>

          <div>

            <h3 className="text-xl font-black text-gray-900">

              {member.name}

            </h3>

            <p className="text-sm text-gray-500">

              {member.relation}

            </p>

          </div>

        </div>

        <div className="mt-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <p className="mt-5 text-[15px] leading-7 text-gray-600">

          Family is where love begins and blessings never end.
          Every smile, every prayer and every memory makes this
          celebration unforgettable.

        </p>

        <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(255,150,70,.35)] transition duration-300 hover:scale-[1.02]">

          View Profile

        </button>

      </div>

    </div>
  );
}