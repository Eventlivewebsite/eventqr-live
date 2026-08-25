"use client";

type Props = {
  onMenuClick?: () => void;
};

export default function Header({
  onMenuClick,
}: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto flex h-16 max-w-[430px] items-center justify-between px-4">

        <div>

          <h1 className="text-[18px] font-bold tracking-wide text-[#B68D40]">
            A & S WEDDING
          </h1>

          <p className="text-xs text-gray-500">
            Forever Begins Today
          </p>

        </div>

        <button
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-amber-50 hover:shadow-xl active:scale-95"
        >
          <span className="text-xl font-bold text-[#B68D40]">
            ☰
          </span>
        </button>

      </div>

    </header>
  );
}