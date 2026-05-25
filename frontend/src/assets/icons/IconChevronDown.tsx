export default function IconChevronDown({
  size = 16,
  color = "#888",
  className,
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" className={className} style={style}>
      <path
        d={size === 12 ? "M2 4l4 4 4-4" : "M3 6l5 5 5-5"}
        stroke={color}
        strokeWidth={size === 12 ? "1.5" : "1.6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
