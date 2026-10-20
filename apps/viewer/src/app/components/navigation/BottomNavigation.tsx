"use client";

import { Home, Image, Video, Mail } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlSlug = sp.get("event") || sp.get("slug") || "";
      if (urlSlug) {
        setSlug(urlSlug);
        sessionStorage.setItem("active_event_slug", urlSlug);
      } else {
        const cached = sessionStorage.getItem("active_event_slug") || "";
        if (cached) setSlug(cached);
      }
    }
  }, [pathname]);

  const menus = [
    { title: "Home", icon: Home, path: "/" },
    { title: "Gallery", icon: Image, path: "/gallery" },
    { title: "Videos", icon: Video, path: "/videos" },
    { title: "Invite", icon: Mail, path: "/invitation" },
  ];

  const handleNav = (targetPath: string) => {
    const activeSlug = slug || (typeof window !== "undefined" ? sessionStorage.getItem("active_event_slug") || "" : "");
    if (activeSlug) {
      router.push(`${targetPath}?slug=${encodeURIComponent(activeSlug)}`);
    } else {
      router.push(targetPath);
    }
  };

  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[92%] max-w-[400px] -translate-x-1/2">
      <div className="flex items-center justify-around rounded-2xl border border-stone-200/70 bg-white/90 px-3 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl">
        {menus.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <button
              key={item.title}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-200 active:scale-90 ${
                active
                  ? "text-amber-600 font-bold"
                  : "text-stone-400 hover:text-stone-700 font-medium"
              }`}
            >
              <Icon size={20} className={active ? "stroke-[2.4]" : "stroke-[1.8]"} />
              <span className="text-[10px] tracking-tight">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}