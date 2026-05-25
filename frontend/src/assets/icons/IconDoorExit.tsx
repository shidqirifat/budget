export default function IconDoorExit({
  size = 16,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="8" height="14" rx="1.5" stroke={color} strokeWidth="1.5" />
      <path d="M10 5.5L13.5 8L10 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8H13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
