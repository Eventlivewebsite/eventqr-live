import * as React from "react";

interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Checkbox(props: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-white/20 accent-pink-500"
      {...props}
    />
  );
}