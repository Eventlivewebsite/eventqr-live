"use client";

type Props = {
  current: number;
  total: number;
};

export default function ViewerCounter({
  current,
  total,
}: Props) {
  return (
    <div className="absolute bottom-6 rounded-full bg-white/10 px-5 py-2 text-sm text-white backdrop-blur">
      {current + 1} / {total}
    </div>
  );
}