import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-text-muted tracking-widest mb-2 uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-[11px] rounded-lg border border-border-input text-sm text-text-primary outline-none focus:border-text-primary transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
