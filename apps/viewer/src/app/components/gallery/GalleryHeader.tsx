"use client";

import { ArrowLeft, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  onMenuClick?: () => void;
};

export default function GalleryHeader({

  const [eventName, setEventName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("event") || sp.get("slug") || sessionStorage.getItem("active_event_slug") || "";
      if (s) {
        fetch(`/api/event-data?slug=${encodeURIComponent(s)}`)
          .then(r => r.json())
          .then(d => {
            if (d?.event?.name || d?.event?.title) {
              setEventName(d.event.name || d.event.title);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  onMenuClick,
}: Props) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-xl">

      <style jsx global>{`
        @keyframes luxuryColorShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-event-heading {
          background: linear-gradient(-45deg, #d97706, #e11d48, #9333ea, #2563eb, #b45309);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: luxuryColorShift 5s ease-in-out infinite;
        }
      `}</style>
    
      <div className="flex items-center justify-between px-5 py-4">

        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="rounded-xl p-2 transition hover:bg-gray-100"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Title */}
        <div className="text-center">
          <h1 className="animated-event-heading text-xl font-black tracking-tight text-center uppercase">{eventName || "WASIM"}</h1>

          <p className="mt-1 text-sm text-gray-500">
            Browse all memories
          </p>
        </div>

        {/* Menu */}
        <button
          onClick={() => onMenuClick?.()}
          className="rounded-xl p-2 transition hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>

      </div>
    </header>
  );
}