import PremiumCard from "../ui/PremiumCard";
import { Image, ArrowRight } from "lucide-react";

const albums = [
  {
    title: "Wedding",
    count: "120 Photos",
  },
  {
    title: "Haldi",
    count: "85 Photos",
  },
  {
    title: "Reception",
    count: "210 Photos",
  },
];

export default function AlbumsSection() {
  return (
    <section className="mt-8 px-5">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">📚 Albums</h2>

        <button className="text-sm font-semibold text-amber-600">
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">

        {albums.map((album) => (
          <PremiumCard
            key={album.title}
            className="group cursor-pointer"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Image size={24} />
              </div>

              <ArrowRight
                size={18}
                className="text-gray-400 transition-transform group-hover:translate-x-1"
              />

            </div>

            <h3 className="mt-4 font-bold">
              {album.title}
            </h3>

            <p className="text-sm text-gray-500">
              {album.count}
            </p>

          </PremiumCard>
        ))}

      </div>

    </section>
  );
}