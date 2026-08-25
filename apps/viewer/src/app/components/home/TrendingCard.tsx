import { Heart, Eye, ArrowRight } from "lucide-react";

type TrendingCardProps = {
  title: string;
  subtitle: string;
  image: string;
  views: string;
  likes: string;
};

export default function TrendingCard({
  title,
  subtitle,
  image,
  views,
  likes,
}: TrendingCardProps) {
  return (
    <div className="group overflow-hidden rounded-[24px] bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

      <div className="relative h-40 overflow-hidden">

        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-4 left-4">

          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
            <Heart size={18} fill="white" />
          </div>

          <h3 className="font-bold text-white">
            {title}
          </h3>

          <p className="text-sm text-white/80">
            {subtitle}
          </p>

        </div>

      </div>

      <div className="flex items-center justify-between p-4">

        <div className="flex gap-4 text-sm text-gray-500">

          <span className="flex items-center gap-1">
            <Eye size={16} />
            {views}
          </span>

          <span className="flex items-center gap-1">
            <Heart size={16} />
            {likes}
          </span>

        </div>

        <ArrowRight
          size={18}
          className="text-amber-600 transition-transform group-hover:translate-x-1"
        />

      </div>

    </div>
  );
}