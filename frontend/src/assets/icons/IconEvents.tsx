export default function IconEvents({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="5" y="1" width="1.5" height="4" rx=".75" fill="currentColor" />
      <rect x="9.5" y="1" width="1.5" height="4" rx=".75" fill="currentColor" />
      <rect x="1" y="7" width="14" height="1.5" fill="currentColor" />
    </svg>
  );
}
