import { formatRp } from "@/utils/designData";
import { monthLabel } from "@/utils/analytics";
import { CatWithColor } from "@/hooks/useAnalytics";

interface CategoryDetailListProps {
  type: "income" | "expense";
  month: string;
  cats: CatWithColor[];
  total: number;
}

export default function CategoryDetailList({
  type,
  month,
  cats,
  total,
}: CategoryDetailListProps) {
  const isExpense = type === "expense";
  const amountColorClass = isExpense ? "text-text-expense" : "text-text-income";

  if (cats.length === 0) {
    return (
      <div className="bg-bg-white rounded-xl p-8 sm:p-10 border border-border-default text-center text-text-muted text-[14px]">
        No {isExpense ? "expenses" : "income"} recorded for {monthLabel(month)}
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      {cats.map((cat, ci) => {
        const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
        return (
          <div
            key={ci}
            className="bg-bg-white rounded-xl px-4 sm:px-[22px] py-4 sm:py-[18px] border border-border-default mb-3"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 mb-3 flex-wrap">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-[14px] font-bold text-text-primary flex-1 min-w-0 truncate">
                {cat.name}
              </span>
              <span className={["text-[13px] font-bold shrink-0", amountColorClass].join(" ")}>
                {formatRp(isExpense ? -cat.amount : cat.amount)}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-[10px] bg-bg-primary text-text-secondary shrink-0">
                {pct}% of total
              </span>
            </div>

            <div className="h-1.5 rounded-[3px] bg-[#F2F2EE] overflow-hidden mb-2.5">
              <div
                className="h-full rounded-[3px] transition-[width] duration-400 ease"
                style={{ width: `${pct}%`, background: cat.color }}
              />
            </div>

            {cat.subs.map((s, si) => (
              <div key={si} className="flex items-center gap-2 py-1.5">
                <div className="w-1 h-1 rounded-full bg-[#ddd] shrink-0" />
                <span className="text-[12px] text-text-secondary flex-1 truncate">{s.name}</span>
                <span className="text-[11px] text-text-muted shrink-0">
                  {cat.amount > 0 ? Math.round((s.amount / cat.amount) * 100) : 0}%
                </span>
                <span className="text-[12px] font-medium text-text-muted min-w-[70px] text-right shrink-0">
                  {formatRp(isExpense ? -s.amount : s.amount)}
                </span>
              </div>
            ))}

            {cat.subs.length === 0 && (
              <div className="text-[12px] text-[#ddd] pt-1">
                No subcategory breakdown
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
