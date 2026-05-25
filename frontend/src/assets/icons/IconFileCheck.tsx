export default function IconFileCheck({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="2" width="12" height="16" rx="2" stroke="#D1FF19" strokeWidth="1.5" fill="none" />
      <path d="M12 2v5h4" stroke="#D1FF19" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 13h6M7 10h4" stroke="#D1FF19" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 18l2 2 4-4" stroke="#2A9D5C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
