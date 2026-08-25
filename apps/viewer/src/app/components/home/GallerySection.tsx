import { ArrowRight, Camera, Video } from "lucide-react";
import PremiumCard from "../ui/PremiumCard";
import Link from "next/link";

export default function GallerySection() {
  return (
    <section className="p-5">

      <h2 className="mb-4 text-xl font-bold">
        📸 Gallery
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {/* Photos */}

        <Link href="/gallery">

          <PremiumCard className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-[#fffdf9] via-[#fff5eb] to-[#ffe6cf] shadow-[0_10px_18px_rgba(255,175,100,0.12),0_28px_60px_rgba(255,175,100,0.20),inset_0_2px_0_rgba(255,255,255,0.95)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(255,175,100,0.20),0_35px_70px_rgba(255,175,100,0.30),inset_0_2px_0_rgba(255,255,255,1)]">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-200/30 blur-3xl" />
            <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-pink-200/20 blur-3xl" />

            <div className="relative flex items-start justify-between">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-orange-500 shadow-lg backdrop-blur-xl">
                <Camera size={28} />
              </div>

              <ArrowRight
                size={20}
                className="text-gray-400 transition-all duration-300 group-hover:translate-x-1"
              />

            </div>

            <h3 className="relative mt-5 text-lg font-bold text-gray-900">
              Photos
            </h3>

            <p className="relative mt-1 text-sm text-gray-600">
              245 Images
            </p>

            <div className="relative mt-5 flex items-center justify-between">

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Updated Today
              </span>

              <span className="text-sm font-semibold text-orange-500">
                Explore
              </span>

            </div>

          </PremiumCard>

        </Link>

        {/* Videos */}

        <Link href="/videos">

          <PremiumCard className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-[#faf8ff] via-[#f1ecff] to-[#e5dcff] shadow-[0_10px_18px_rgba(145,120,255,0.12),0_28px_60px_rgba(145,120,255,0.20),inset_0_2px_0_rgba(255,255,255,0.95)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(145,120,255,0.20),0_35px_70px_rgba(145,120,255,0.30),inset_0_2px_0_rgba(255,255,255,1)]">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl" />
            <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-pink-200/20 blur-3xl" />

            <div className="relative flex items-start justify-between">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-violet-500 shadow-lg backdrop-blur-xl">
                <Video size={28} />
              </div>

              <ArrowRight
                size={20}
                className="text-gray-400 transition-all duration-300 group-hover:translate-x-1"
              />

            </div>

            <h3 className="relative mt-5 text-lg font-bold text-gray-900">
              Videos
            </h3>

            <p className="relative mt-1 text-sm text-gray-600">
              32 Videos
            </p>

            <div className="relative mt-5 flex items-center justify-between">

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Updated Today
              </span>

              <span className="text-sm font-semibold text-violet-500">
                Explore
              </span>

            </div>

          </PremiumCard>

        </Link>

      </div>

      {/* Trending */}

      <h2 className="mt-8 mb-4 text-xl font-bold">
        🔥 Trending
      </h2>

      <PremiumCard className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-r from-[#fff8f2] via-[#fff2f8] to-[#f4eeff] shadow-[0_10px_18px_rgba(255,165,135,0.12),0_28px_60px_rgba(255,165,135,0.20),inset_0_2px_0_rgba(255,255,255,0.95)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(255,165,135,0.20),0_35px_70px_rgba(255,165,135,0.28),inset_0_2px_0_rgba(255,255,255,1)]">

        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-pink-200/25 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="relative">

          <h3 className="font-semibold text-gray-900">
            ❤️ Most Loved Moments
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Wedding Highlights
          </p>

        </div>

      </PremiumCard>

    </section>
  );
}