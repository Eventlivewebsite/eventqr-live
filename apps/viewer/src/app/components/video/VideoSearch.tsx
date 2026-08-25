"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function VideoSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative mb-6">
      <Search
        size={20}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        placeholder="Search videos..."
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-5 text-sm shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-red-400 focus:ring-4 focus:ring-red-100"
      />
    </div>
  );
}