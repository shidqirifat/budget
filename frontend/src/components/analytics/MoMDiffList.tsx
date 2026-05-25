import { formatRp } from "@/utils/designData";
import { monthShort } from "@/utils/analytics";
import { AnalyticsCategoryDiff } from "@/services/transaction.service";
import { AnalyticsMonthly } from "@/services/transaction.service";

interface MoMDiffListProps {
  prev: AnalyticsMonthly;
  expenseDiffs: AnalyticsCategoryDiff[];
  incomeDiffs: AnalyticsCategoryDiff[];
}

function DiffRow({
  d,
  type,
}: {
  d: AnalyticsCategoryDiff;
  type: "expense" | "income";
}) {
  const isExpense = type === "expense";
  const positiveClass = isExpense ? "text-text-expense" : "text-text-income";
  const negativeClass = isExpense ? "text-text-income" : "text-text-expense";
  const diffColorClass = d.diff > 0 ? positiveClass : negativeClass;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[11px]">{d.diff > 0 ? "📈" : "📉"}</span>
        <span className="text-[12px] font-semibold text-[#333] flex-1">
          {d.name}
        </span>
        <span className={["text-[12px] font-bold", diffColorClass].join(" ")}>
          {d.diff > 0 ? "+" : ""}
          {formatRp(d.diff)}
        </span>
      </div>
      <div className="text-[10px] text-text-muted pl-4">
        {isExpense
          ? `${formatRp(-d.prev)} → ${formatRp(-d.current)}`
          : `${formatRp(d.prev)} → ${formatRp(d.current)}`}
      </div>
    </div>
  );
}

export default function MoMDiffList({
  prev,
  expenseDiffs,
  incomeDiffs,
}: MoMDiffListProps) {
  if (!expenseDiffs.length && !incomeDiffs.length) return null;

  return (
    <div className="p-[10px_14px] bg-[#FAFAFA] rounded-[10px] border border-border-default">
      <div className="text-[10px] text-text-muted font-semibold tracking-[0.07em] mb-2">
        VS {monthShort(prev.month).toUpperCase()}
      </div>
      <div className="flex flex-col gap-1.5">
        {expenseDiffs.map((d, i) => (
          <DiffRow key={i} d={d} type="expense" />
        ))}
        {incomeDiffs.map((d, i) => (
          <DiffRow key={`inc-${i}`} d={d} type="income" />
        ))}
      </div>
    </div>
  );
}
