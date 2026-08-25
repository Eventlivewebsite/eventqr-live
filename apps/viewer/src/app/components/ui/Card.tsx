import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Card({
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-white/10
        bg-white/10
        backdrop-blur-xl
        shadow-2xl
        p-8
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}