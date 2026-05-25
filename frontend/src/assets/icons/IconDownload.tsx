export default function IconDownload({
  size = 16,
  color = "#111",
  className,
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isSmall = size <= 13;
  return (
    <svg width={size} height={size} viewBox={isSmall ? "0 0 13 13" : "0 0 16 16"} fill="none" className={className} style={style}>
      {isSmall ? (
        <>
          <path d="M6.5 1v8M3 6.5l3.5 3.5 3.5-3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 11h11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M8 1v9M4 7l4 4 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 13h12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
