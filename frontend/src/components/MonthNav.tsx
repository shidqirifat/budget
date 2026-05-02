const MONTH_LIST = [
  '2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06',
];

export const MONTH_LABELS: Record<string, string> = {
  '2025-11': 'November 2025', '2025-12': 'December 2025',
  '2026-01': 'January 2026',  '2026-02': 'February 2026',
  '2026-03': 'March 2026',    '2026-04': 'April 2026',
  '2026-05': 'May 2026',      '2026-06': 'June 2026',
};

export { MONTH_LIST };

interface Props {
  month: string;
  setMonth: (m: string) => void;
}

export default function MonthNav({ month, setMonth }: Props) {
  const idx = MONTH_LIST.indexOf(month);
  const canPrev = idx > 0;
  const canNext = idx < MONTH_LIST.length - 1;

  const btn = (enabled: boolean, dir: string, onClick: () => void) => (
    <button onClick={onClick} disabled={!enabled} style={{
      background: 'none', border: 'none', cursor: enabled ? 'pointer' : 'default',
      color: enabled ? '#555' : '#ddd', fontSize: 18, lineHeight: 1, padding: '0 4px',
      display: 'flex', alignItems: 'center',
    }}>{dir}</button>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #E5E5E0', borderRadius: 8, padding: '6px 10px' }}>
      {btn(canPrev, '‹', () => setMonth(MONTH_LIST[idx - 1]))}
      <span style={{ fontSize: 13, fontWeight: 600, color: '#333', minWidth: 110, textAlign: 'center' }}>
        {MONTH_LABELS[month] ?? month}
      </span>
      {btn(canNext, '›', () => setMonth(MONTH_LIST[idx + 1]))}
    </div>
  );
}
