export default function IconUpload({ color = "#aaa", className }: { color?: string; className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className={className}>
      <path d="M11 14V4M7 8l4-4 4 4" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17h16" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
