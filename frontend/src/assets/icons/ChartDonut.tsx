import { monthShort } from "@/utils/analytics";

interface DonutItem {
  color: string;
  amount: number;
}

interface ChartDonutProps {
  items: DonutItem[];
  total: number;
  month: string;
}

export default function ChartDonut({ items, total, month }: ChartDonutProps) {
  if (!items.length) return null;

  const SIZE = 140;
  const CX = 70;
  const CY = 70;
  const R = 56;
  const IR = 36;

  let angle = -Math.PI / 2;
  const slices = items.map((c) => {
    const pct = total > 0 ? c.amount / total : 0;
    const sa = angle;
    const ea = angle + pct * Math.PI * 2;
    const x1 = CX + R * Math.cos(sa);
    const y1 = CY + R * Math.sin(sa);
    const x2 = CX + R * Math.cos(ea);
    const y2 = CY + R * Math.sin(ea);
    angle = ea;
    return { ...c, pct, x1, y1, x2, y2, lrg: pct > 0.5 ? 1 : 0 };
  });

  const isSingle = slices.length === 1;

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {isSingle ? (
        <circle cx={CX} cy={CY} r={R} fill={slices[0].color} />
      ) : (
        slices.map((s, i) => (
          <path
            key={i}
            d={`M${CX},${CY} L${s.x1},${s.y1} A${R},${R} 0 ${s.lrg},1 ${s.x2},${s.y2} Z`}
            fill={s.color}
          />
        ))
      )}
      <circle cx={CX} cy={CY} r={IR} fill="white" />
      <text
        x={CX}
        y={CY - 4}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#111"
        fontFamily="'Space Grotesk',sans-serif"
      >
        Total
      </text>
      <text
        x={CX}
        y={CY + 10}
        textAnchor="middle"
        fontSize={9}
        fill="#888"
        fontFamily="'Space Grotesk',sans-serif"
      >
        {monthShort(month)}
      </text>
    </svg>
  );
}
