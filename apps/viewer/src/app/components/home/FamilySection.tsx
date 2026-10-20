"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Users, Heart } from "lucide-react";

interface Member {
  name?: string;
  personName?: string;
  role?: string;
  relation?: string;
  photo?: string;
  avatar?: string;
}

export default function FamilySection() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    async function loadFamily() {
      try {
        const sp = new URLSearchParams(window.location.search);
        let s = sp.get("event") || sp.get("slug") || "";
        if (!s && typeof window !== "undefined") {
          s = sessionStorage.getItem("active_event_slug") || "";
        }

        const res = await fetch(`/api/event-data?slug=${encodeURIComponent(s)}&_t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();

        if (json?.success && json?.event) {
          const raw = json.event.familyMembers || json.event.customMap?.familyMembers || json.event.customMap?.keyPeople || [];
          if (Array.isArray(raw) && raw.length > 0) {
            setMembers(raw);
          }
        }
      } catch (e) {
        console.error("Family load error", e);
      }
    }
    loadFamily();
  }, []);

  if (members.length === 0) return null;

  return (
    <section className="px-3.5 mt-3">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-xs">
            <Users size={13} />
          </div>
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
            Key People & VIPs
          </h2>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
          <Heart size={10} className="fill-rose-500 text-rose-500" />
          Family
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {members.map((m, idx) => {
          const name = m.name || m.personName || "Member";
          const role = m.role || m.relation || "VIP Family";
          const photoUrl = m.photo || m.avatar || "";

          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-2xl border border-stone-200/80 bg-white p-2.5 shadow-xs transition hover:border-amber-300"
            >
              <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                {photoUrl ? (
                  <Image src={photoUrl} alt={name} fill className="object-cover" />
                ) : (
                  <Users size={18} className="text-amber-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-stone-900 truncate leading-tight">
                  {name}
                </h4>
                <p className="text-[10px] font-bold text-rose-600 truncate leading-tight mt-0.5">
                  {role}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}