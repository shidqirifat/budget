interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "active" | "event";
  onRemove?: () => void;
  className?: string;
}

export default function Badge({ children, variant = "default", onRemove, className = "" }: BadgeProps) {
  const variantClass = {
    default: "bg-border-default text-text-secondary",
    active: "bg-text-primary text-bg-lime",
    event: "bg-blue-50 text-blue-500 font-semibold",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px] ${variantClass} ${className}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="opacity-60 hover:opacity-100 cursor-pointer leading-none bg-transparent border-none p-0"
        >
          ✕
        </button>
      )}
    </span>
  );
}
