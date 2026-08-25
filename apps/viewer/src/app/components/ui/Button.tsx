import * as React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90",
    secondary:
      "bg-white/10 text-white hover:bg-white/20",
    outline:
      "border border-white/20 text-white hover:bg-white/10",
  };

  return (
    <button
      className={`
        w-full
        rounded-xl
        px-5
        py-3
        font-semibold
        transition-all
        duration-300
        hover:scale-[1.02]
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}