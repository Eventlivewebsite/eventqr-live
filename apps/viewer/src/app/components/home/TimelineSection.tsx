import PremiumCard from "../ui/PremiumCard";
import { CalendarDays, Clock } from "lucide-react";

const events = [
  {
    id: 1,
    status: "LIVE",
    title: "Wedding Reception",
    time: "06:00 PM",
    color: "bg-red-500",
  },
  {
    id: 2,
    status: "UPCOMING",
    title: "Dinner",
    time: "08:00 PM",
    color: "bg-orange-500",
  },
  {
    id: 3,
    status: "COMPLETED",
    title: "Haldi Ceremony",
    time: "11:00 AM",
    color: "bg-green-500",
  },
];

export default function TimelineSection() {
  return (
    <section className="mt-8 px-5">

      <div className="mb-5 flex items-center gap-2">
        <CalendarDays className="text-amber-600" size={22} />
        <h2 className="text-xl font-bold">
          Event Timeline
        </h2>
      </div>

      <div className="space-y-4">

        {events.map((event) => (

          <PremiumCard key={event.id}>

            <div className="flex items-start gap-4">

              {/* Dot */}

              <div
                className={`mt-1 h-3 w-3 rounded-full ${event.color}`}
              />

              <div className="flex-1">

                <div className="flex items-center justify-between">

                  <h3 className="font-bold">
                    {event.title}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      event.status === "LIVE"
                        ? "bg-red-50 text-red-600"
                        : event.status === "UPCOMING"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {event.status}
                  </span>

                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={15} />
                  {event.time}
                </div>

              </div>

            </div>

          </PremiumCard>

        ))}

      </div>

    </section>
  );
}