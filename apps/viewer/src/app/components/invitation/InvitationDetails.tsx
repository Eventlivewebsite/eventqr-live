"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

export default function InvitationDetails() {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-xl">

      <h2 className="mb-6 text-center text-2xl font-bold">
        Wedding Details
      </h2>

      <div className="space-y-5">

        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">

          <div className="rounded-xl bg-amber-100 p-3">
            <CalendarDays
              size={22}
              className="text-amber-600"
            />
          </div>

          <div>

            <p className="text-sm text-gray-500">
              Date
            </p>

            <h3 className="font-semibold">
              15 February 2027
            </h3>

          </div>

        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">

          <div className="rounded-xl bg-blue-100 p-3">
            <Clock3
              size={22}
              className="text-blue-600"
            />
          </div>

          <div>

            <p className="text-sm text-gray-500">
              Time
            </p>

            <h3 className="font-semibold">
              7:00 PM
            </h3>

          </div>

        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">

          <div className="rounded-xl bg-rose-100 p-3">
            <MapPin
              size={22}
              className="text-rose-500"
            />
          </div>

          <div>

            <p className="text-sm text-gray-500">
              Venue
            </p>

            <h3 className="font-semibold">
              Taj Palace, New Delhi
            </h3>

          </div>

        </div>

      </div>

    </section>
  );
}