interface AvatarProps {
  icon: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

const SIZE: Record<
  NonNullable<AvatarProps["size"]>,
  { wrap: string; emoji: string; initial: string }
> = {
  sm: { wrap: "w-7 h-7", emoji: "text-sm", initial: "text-[10px]" },
  md: { wrap: "w-8 h-8", emoji: "text-base", initial: "text-[11px]" },
  lg: { wrap: "w-[50px] h-[50px]", emoji: "text-2xl", initial: "text-base" },
};

export default function Avatar({ icon, name, size = "md" }: AvatarProps) {
  const s = SIZE[size];
  if (icon) {
    return (
      <div
        className={`${s.wrap} rounded-full bg-bg-primary flex items-center justify-center shrink-0`}
      >
        <span className={s.emoji}>{icon}</span>
      </div>
    );
  }
  return (
    <div
      className={`${s.wrap} rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 font-bold ${s.initial}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
