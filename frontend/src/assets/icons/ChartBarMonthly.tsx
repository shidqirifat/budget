import { AnalyticsMonthly } from "@/services/transaction.service";
import { monthShort } from "@/utils/analytics";

interface ChartBarMonthlyProps {
  months: AnalyticsMonthly[];
  activeMonth: string;
}

export default function ChartBarMonthly({
  months,
  activeMonth,
}: ChartBarMonthlyProps) {
  if (!months.length) return null;

  const maxVal = Math.max(
    ...months.map((m) => Math.max(m.inflow, m.outflow)),
    1,
  );
  const BAR_H = 350;
  const BAR_W = 28;
  const GAP = 14;
  const GROUP = BAR_W * 2 + GAP;
  const TOTAL = months.length * (GROUP + 20);

  return (
    <svg
      width={TOTAL + 40}
      height={BAR_H + 48}
      style={{ overflow: "visible", display: "block" }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
        <g key={i}>
          <line
            x1={0}
            y1={BAR_H - v * BAR_H}
            x2={TOTAL + 20}
            y2={BAR_H - v * BAR_H}
            stroke="#F0F0EA"
            strokeWidth="1"
            strokeDasharray={v === 0 ? "none" : "4,4"}
          />
          <text
            x={-8}
            y={BAR_H - v * BAR_H + 4}
            textAnchor="end"
            fontSize={9}
            fill="#ccc"
            fontFamily="'Space Grotesk',sans-serif"
          >
            {v === 0 ? "0" : `${((v * maxVal) / 1000000).toFixed(1)}jt`}
          </text>
        </g>
      ))}
      {months.map((m, i) => {
        const isCur = m.month === activeMonth;
        const x = i * (GROUP + 20) + 10;
        const inH = Math.round((m.inflow / maxVal) * BAR_H);
        const outH = Math.round((m.outflow / maxVal) * BAR_H);
        return (
          <g key={i}>
            {isCur && (
              <rect
                x={x - 4}
                y={-8}
                width={GROUP + 8}
                height={BAR_H + 8}
                rx={6}
                fill="#F5FFF0"
                stroke="#D1FF19"
                strokeWidth="1.5"
                style={{ opacity: 0.4 }}
              />
            )}
            <rect
              x={x}
              y={BAR_H - inH}
              width={BAR_W}
              height={inH}
              rx={4}
              fill={isCur ? "#2A9D5C" : "#DCEEE5"}
            />
            <rect
              x={x + BAR_W + GAP}
              y={BAR_H - outH}
              width={BAR_W}
              height={outH}
              rx={4}
              fill={isCur ? "#D1FF19" : "#EAEAE4"}
            />
            <text
              x={x + GROUP / 2}
              y={BAR_H + 18}
              textAnchor="middle"
              fontSize={11}
              fontWeight={isCur ? 700 : 400}
              fill={isCur ? "#111" : "#bbb"}
              fontFamily="'Space Grotesk',sans-serif"
            >
              {monthShort(m.month)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
