"use client";

export default function InvitationHero() {
  return (
    <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-100 via-white to-amber-100 px-7 py-14 shadow-xl">

      <div className="text-center">

        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">
          Wedding Invitation
        </p>

        <h1 className="mt-6 text-5xl font-extrabold tracking-widest text-gray-900">
          A <span className="text-amber-500">&</span> S
        </h1>

        <p className="mt-3 text-2xl font-light text-gray-700">
          Together Forever
        </p>

        <div className="mt-8 text-5xl">
          🤍
        </div>

        <p className="mx-auto mt-8 max-w-sm text-sm leading-7 text-gray-500">
          Together with our families we request the honour of your
          presence to celebrate our wedding ceremony and blessings.
        </p>

      </div>

    </section>
  );
}