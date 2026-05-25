import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function Button({ loading, disabled, children, className = "", ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`w-full py-3 rounded-lg bg-bg-lime text-text-primary text-sm font-bold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-opacity ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
