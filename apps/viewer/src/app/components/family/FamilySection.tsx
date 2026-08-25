"use client";

import familyData from "./family-data";
import FamilyCard from "./FamilyCard";

export default function FamilySection() {
  const brideFamily = familyData
    .filter(
      (member) =>
        member.side === "Bride" &&
        member.visible
    )
    .sort(
      (a, b) =>
        a.priority - b.priority
    );

  const groomFamily = familyData
    .filter(
      (member) =>
        member.side === "Groom" &&
        member.visible
    )
    .sort(
      (a, b) =>
        a.priority - b.priority
    );

  return (
    <section className="space-y-12">

      {/* Bride Family */}

      <div>

        <div className="mb-6 flex items-center gap-3">

          <div className="h-10 w-1 rounded-full bg-gradient-to-b from-pink-500 to-rose-500" />

          <div>

            <h2 className="text-2xl font-black text-gray-900">
              👰 Bride Family
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              The beautiful people behind the bride.
            </p>

          </div>

        </div>

        <div className="grid gap-6">

          {brideFamily.map((member) => (
            <FamilyCard
              key={member.id}
              member={member}
            />
          ))}

        </div>

      </div>

      {/* Groom Family */}

      <div>

        <div className="mb-6 flex items-center gap-3">

          <div className="h-10 w-1 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />

          <div>

            <h2 className="text-2xl font-black text-gray-900">
              🤵 Groom Family
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              The wonderful people behind the groom.
            </p>

          </div>

        </div>

        <div className="grid gap-6">

          {groomFamily.map((member) => (
            <FamilyCard
              key={member.id}
              member={member}
            />
          ))}

        </div>

      </div>

      {/* Footer */}

      <div className="overflow-hidden rounded-[34px] border border-white/70 bg-gradient-to-br from-[#fff8ef] via-[#fffdf8] to-[#fff5f2] p-7 shadow-[0_20px_60px_rgba(0,0,0,.08)]">

        <h3 className="text-xl font-bold text-gray-900">
          ❤️ Together We Celebrate
        </h3>

        <p className="mt-3 leading-7 text-gray-600">
          Every family member brings love, blessings,
          happiness and unforgettable memories to this
          beautiful celebration. We are grateful for your
          presence on our special day.
        </p>

      </div>

    </section>
  );
}