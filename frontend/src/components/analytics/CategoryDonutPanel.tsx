import { formatRp } from "@/utils/designData";
import { monthLabel } from "@/utils/analytics";
import { CatWithColor } from "@/hooks/useAnalytics";
import ChartDonut from "@/assets/icons/ChartDonut";

interface CategoryDonutPanelProps {
  type: "income" | "expense";
  month: string;
  cats: CatWithColor[];
  total: number;
}

export default function CategoryDonutPanel({
  type,
  month,
  cats,
  total,
}: CategoryDonutPanelProps) {
  const isExpense = type === "expense";
  const title = isExpense ? "Outflow by Category" : "Inflow by Category";
  const amountColorClass = isExpense ? "text-text-expense" : "text-text-income";
  const emptyLabel = isExpense
    ? "No expenses this month"
    : "No income this month";

  return (
    <div className="bg-bg-white rounded-xl px-5 sm:px-7 py-5 sm:py-[22px] border border-border-default md:w-[300px] md:shrink-0">
      <div className="text-[15px] font-bold text-text-primary mb-1">{title}</div>
      <div className="text-[12px] text-text-muted mb-5">
        {monthLabel(month)} · Total {formatRp(isExpense ? -total : total)}
      </div>

      <div className="flex justify-center mb-6">
        <ChartDonut items={cats} total={total} month={month} />
      </div>

      {cats.map((c, i) => (
        <div key={i} className="flex items-center gap-2.5 mb-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: c.color }}
          />
          <span className="text-[13px] text-[#333] flex-1 truncate">{c.name}</span>
          <span className="text-[12px] font-semibold text-text-secondary shrink-0">
            {total > 0 ? Math.round((c.amount / total) * 100) : 0}%
          </span>
          <span
            className={[
              "text-[12px] font-bold min-w-[80px] sm:min-w-[90px] text-right shrink-0",
              amountColorClass,
            ].join(" ")}
          >
            {formatRp(isExpense ? -c.amount : c.amount)}
          </span>
        </div>
      ))}

      {cats.length === 0 && (
        <div className="text-[13px] text-text-muted text-center mt-5">
          {emptyLabel}
        </div>
      )}
    </div>
  );
}
