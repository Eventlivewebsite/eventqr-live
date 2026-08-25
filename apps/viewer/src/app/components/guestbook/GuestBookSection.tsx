"use client";

import GuestBookCard from "./GuestBookCard";
import { guestBookData } from "./guestbook-data";

export default function GuestBookSection() {
  return (
    <section className="mt-8">

      {/* Heading */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-gray-900">
            Beautiful Wishes
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Messages from family & friends
          </p>

        </div>

        <div className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-600">
          {guestBookData.length} Wishes
        </div>

      </div>

      {/* Write Wish Button */}

      <button
        className="group mb-8 w-full overflow-hidden rounded-[26px]
        bg-gradient-to-r from-pink-500 via-rose-500 to-red-500
        px-6 py-5 text-white
        shadow-[0_18px_45px_rgba(244,63,94,.35)]
        transition-all duration-500
        hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(244,63,94,.45)]"
      >

        <div className="flex items-center justify-between">

          <div className="text-left">

            <h3 className="text-lg font-bold">
              ✍ Leave Your Blessing
            </h3>

            <p className="mt-1 text-sm text-pink-100">
              Share your wishes with the couple
            </p>

          </div>

          <div
            className="flex h-14 w-14 items-center justify-center
            rounded-2xl bg-white/20 text-2xl backdrop-blur-xl
            transition duration-300 group-hover:rotate-12"
          >
            ❤️
          </div>

        </div>

      </button>

      {/* Cards */}

      <div className="space-y-6">

        {guestBookData.map((guest) => (

          <GuestBookCard
            key={guest.id}
            name={guest.name}
            avatar={guest.avatar}
            location={guest.location}
            message={guest.message}
            time={guest.time}
            verified={guest.verified}
            likes={guest.likes}
          />

        ))}

      </div>

      {/* Bottom */}

      <div className="mt-10 rounded-[28px] bg-gradient-to-br from-pink-50 via-white to-rose-50 p-6 text-center shadow-inner">

        <div className="text-4xl">
          💖
        </div>

        <h3 className="mt-3 text-xl font-bold">
          Thank You
        </h3>

        <p className="mt-2 text-sm leading-7 text-gray-500">
          Every blessing and every heartfelt message makes this
          celebration even more memorable.
        </p>

      </div>

    </section>
  );
}