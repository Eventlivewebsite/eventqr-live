export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-white/10 bg-slate-950/80 px-8 backdrop-blur-xl">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Welcome back 👋
        </p>
      </div>

      <div className="flex items-center gap-5">

        <input
          placeholder="Search..."
          className="
            w-72
            rounded-2xl
            border
            border-white/10
            bg-slate-900
            px-5
            py-3
            text-white
            outline-none
            transition
            focus:border-pink-500
          "
        />

        <button
          className="
            rounded-2xl
            border
            border-white/10
            bg-slate-900
            px-5
            py-3
            text-white
            transition
            hover:bg-slate-800
          "
        >
          🔔
        </button>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-3 py-2">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-white">
            A
          </div>

          <div>

            <h3 className="font-semibold text-white">
              Admin
            </h3>

            <p className="text-xs text-slate-400">
              Super Admin
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}