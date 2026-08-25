"use client";

import {
  Heart,
  MapPin,
  Clock3,
  BadgeCheck,
  Star,
  Share2,
  MessageCircle,
} from "lucide-react";

type Props = {
  name: string;
  location: string;
  message: string;
  time: string;
  avatar: string;
  verified?: boolean;
  likes: number;
};

export default function GuestBookCard({
  name,
  location,
  message,
  time,
  avatar,
  verified = false,
  likes,
}: Props) {
  return (
    <div className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_15px_45px_rgba(0,0,0,.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,.12)]">

      {/* Background Glow */}

      <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-pink-200/20 blur-3xl" />

      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-200/20 blur-3xl" />

      {/* Header */}

      <div className="relative flex items-start gap-4">

        <img
          src={avatar}
          alt={name}
          className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white shadow-lg"
        />

        <div className="flex-1">

          <div className="flex items-center gap-2">

            <h3 className="text-lg font-bold text-gray-900">
              {name}
            </h3>

            {verified && (
              <BadgeCheck
                size={18}
                className="fill-sky-500 text-white"
              />
            )}

          </div>

          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">

            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {location}
            </div>

            <div className="flex items-center gap-1">
              <Clock3 size={14} />
              {time}
            </div>

          </div>

        </div>

      </div>

      {/* Rating */}

      <div className="mt-5 flex items-center gap-1">

        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={17}
            className="fill-amber-400 text-amber-400"
          />
        ))}

      </div>

      {/* Message */}

      <p className="mt-4 text-[15px] leading-7 text-gray-600">
        {message}
      </p>

      {/* Footer */}

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">

        <button className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-pink-50">

          <Heart
            size={18}
            className="text-pink-500"
          />

          <span className="text-sm font-semibold text-gray-700">
            {likes}
          </span>

        </button>

        <button className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-sky-50">

          <MessageCircle
            size={18}
            className="text-sky-500"
          />

          <span className="text-sm font-medium">
            Reply
          </span>

        </button>

        <button className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-amber-50">

          <Share2
            size={18}
            className="text-amber-500"
          />

          <span className="text-sm font-medium">
            Share
          </span>

        </button>

      </div>

    </div>
  );
}