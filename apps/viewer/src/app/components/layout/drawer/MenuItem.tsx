import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type MenuItemProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
};

export default function MenuItem({
  icon,
  title,
  subtitle,
  onClick,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(255,170,120,0.18)]"
    >
      <div className="flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-2xl shadow-md">
          {icon}
        </div>

        <div className="text-left">

          <h3 className="font-semibold text-gray-900">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}

        </div>

      </div>

      <ChevronRight
        size={20}
        className="text-gray-400 transition-transform duration-300 group-hover:translate-x-1"
      />

    </button>
  );
}