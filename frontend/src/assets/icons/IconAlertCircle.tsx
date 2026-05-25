export default function IconAlertCircle({ size = 13, className }: { size?: number; className?: string }) {
  const cx = size / 2;
  const r = size / 2 - 0.5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" className={className}>
      <circle cx={cx} cy={cx} r={r} stroke="currentColor" strokeWidth="1.3" />
      <path
        d={size === 10
          ? "M5 3v2.5M5 7h.01"
          : "M6.5 4v3M6.5 8.5v.5"}
        stroke="currentColor"
        strokeWidth={size === 10 ? "1.2" : "1.3"}
        strokeLinecap="round"
      />
    </svg>
  );
}
