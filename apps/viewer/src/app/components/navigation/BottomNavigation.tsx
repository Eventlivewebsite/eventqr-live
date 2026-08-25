"use client";

import { Home, Image, Video, Mail } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const menus = [
    {
      title: "Home",
      icon: Home,
      path: "/",
    },
    {
      title: "Gallery",
      icon: Image,
      path: "/gallery",
    },
    {
      title: "Videos",
      icon: Video,
      path: "/videos",
    },
    {
      title: "Invite",
      icon: Mail,
      path: "/invitation",
    },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[30px] border border-white/30 bg-gradient-to-r from-white/85 via-pink-50/90 to-rose-100/85 backdrop-blur-3xl shadow-[0_-15px_50px_rgba(236,72,153,0.25)]">

      <div className="flex items-center justify-around px-3 py-4">

        {menus.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <button
              key={item.title}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 transition ${
                active
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-pink-500"
              }`}
            >
              <Icon size={22} />

              <span className="text-xs font-medium">
                {item.title}
              </span>
            </button>
          );
        })}

      </div>

    </div>
  );
}