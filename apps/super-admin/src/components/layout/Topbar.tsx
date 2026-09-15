"use client";

import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-20 bg-[#090d16] border-b border-slate-800/80 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-black text-white">Dashboard</h2>
        <p className="text-xs text-slate-400">Welcome back 👋</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button className="p-2.5 bg-[#030712] border border-slate-800 rounded-xl text-slate-400 hover:text-white transition">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
            A
          </div>
          <div>
            <p className="text-xs font-bold text-white">Admin</p>
            <p className="text-[10px] text-slate-500 font-semibold">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}