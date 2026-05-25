export default function IconSpinner({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={`animate-spin ${className ?? ""}`}>
      <circle cx="9" cy="9" r="7" stroke="#555" strokeWidth="2" strokeDasharray="30 14" />
    </svg>
  );
}
