import React from "react";

type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function PremiumCard({
  children,
  className = "",
  onClick,
}: PremiumCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)] ${className}`}
    >
      {children}
    </div>
  );
}