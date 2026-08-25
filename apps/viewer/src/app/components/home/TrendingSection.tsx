import { Heart, Flame, Download, ArrowRight } from "lucide-react";
export default function TrendingSection() {
  const items = [
  {
    title: "Most Loved",
    subtitle: "Wedding Highlights",
    icon: Heart,
    color: "from-pink-500 to-rose-400",
  },
  {
    title: "Most Viewed",
    subtitle: "Haldi Moments",
    icon: Flame,
    color: "from-orange-500 to-amber-400",
  },
  {
    title: "Most Downloaded",
    subtitle: "Reception Album",
    icon: Download,
    color: "from-blue-500 to-cyan-400",
  },
];

  return (
    <section className="px-5 mt-8">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold">
          🔥 Trending
        </h2>

        <button className="text-sm font-semibold text-amber-600">
          View All
        </button>

      </div>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2 no-scrollbar">

        {items.map((item) => (
          <div
            key={item.title}
            className={`min-w-[230px] rounded-3xl bg-gradient-to-br ${item.color} p-5 text-white shadow-xl`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
  <item.icon size={28} />
</div>

            <h3 className="mt-5 text-lg font-bold">
              {item.title}
            </h3>

            <p className="mt-1 text-sm text-white/90">
              {item.subtitle}
            </p>

            <button className="mt-6 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-md transition-all duration-300 hover:bg-white/30">
  Explore
  <ArrowRight size={16} />
</button>
          </div>
        ))}

      </div>

    </section>
  );
}