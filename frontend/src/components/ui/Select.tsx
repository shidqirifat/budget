import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  active?: boolean;
}

export default function Select({ label, id, active, className = "", children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[10px] font-semibold text-text-muted tracking-[0.06em] uppercase">
          {label}
        </span>
      )}
      <select
        id={id}
        className={`px-3 py-2 rounded-lg border text-sm outline-none bg-bg-white cursor-pointer transition-colors
          ${active ? "border-bg-lime text-text-primary" : "border-border-input text-text-muted"}
          ${props.disabled ? "bg-neutral-50 cursor-not-allowed opacity-50" : ""}
          ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
