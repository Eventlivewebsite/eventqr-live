import * as React from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      className={`
        w-full
        rounded-xl
        border
        border-white/10
        bg-white/10
        px-4
        py-3
        text-white
        placeholder:text-slate-400
        outline-none
        transition-all
        duration-300
        focus:border-pink-500
        focus:ring-2
        focus:ring-pink-500/20
        ${className}
      `}
      {...props}
    />
  );
}