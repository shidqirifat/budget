import dayjs from '@/utils/dayjs';

// Legacy exports kept for AnalyticsPage until it is fully integrated
export const MONTH_LIST = [
  '2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06',
];
export const MONTH_LABELS: Record<string, string> = Object.fromEntries(
  MONTH_LIST.map(m => [m, dayjs(m + '-01').format('MMMM YYYY')])
);

function addMonths(month: string, delta: number): string {
  return dayjs(month + '-01').add(delta, 'month').format('YYYY-MM');
}

function monthLabel(month: string): string {
  return dayjs(month + '-01').format('MMMM YYYY');
}

function currentMonthKey(): string {
  return dayjs().format('YYYY-MM');
}

interface Props {
  month: string;
  setMonth: (m: string) => void;
  minMonth?: string;
  maxMonth?: string;
}

export default function MonthNav({ month, setMonth, minMonth, maxMonth = currentMonthKey() }: Props) {
  const canPrev = !minMonth || month > minMonth;
  const canNext = month < maxMonth;

  const btn = (enabled: boolean, dir: string, onClick: () => void) => (
    <button onClick={onClick} disabled={!enabled} style={{
      background: 'none', border: 'none', cursor: enabled ? 'pointer' : 'default',
      color: enabled ? '#555' : '#ddd', fontSize: 18, lineHeight: 1, padding: '0 4px',
      display: 'flex', alignItems: 'center',
    }}>{dir}</button>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #E5E5E0', borderRadius: 8, padding: '6px 10px' }} className="w-full lg:w-auto">
      {btn(canPrev, '‹', () => setMonth(addMonths(month, -1)))}
      <span style={{ fontSize: 13, fontWeight: 600, color: '#333', textAlign: 'center' }} className="flex-1 lg:min-w-[110px] lg:flex-none">
        {monthLabel(month)}
      </span>
      {btn(canNext, '›', () => setMonth(addMonths(month, 1)))}
    </div>
  );
}
