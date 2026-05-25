import { formatRp } from "@/utils/designData";
import { monthShort } from "@/utils/analytics";
import { CatWithColor } from "@/hooks/useAnalytics";
import { AnalyticsMonthly } from "@/services/transaction.service";

interface CategoryBreakdownTableProps {
  type: "income" | "expense";
  month: string;
  cats: CatWithColor[];
  total: number;
  prev: AnalyticsMonthly | undefined;
}

export default function CategoryBreakdownTable({
  type,
  month,
  cats,
  total,
  prev,
}: CategoryBreakdownTableProps) {
  const isExpense = type === "expense";
  const amountColorClass = isExpense ? "text-text-expense" : "text-text-income";
  const title = isExpense ? "Expense Categories" : "Income Categories";

  const headers = [
    "Category",
    ...(prev ? [monthShort(prev.month)] : []),
    monthShort(month),
    "% of Total",
    ...(prev ? ["% Diff"] : []),
  ];

  return (
    <div className="bg-bg-white rounded-xl px-4 sm:px-7 py-5 sm:py-[22px] border border-border-default flex-1 min-w-0 overflow-x-auto">
      <div className="text-[15px] font-bold text-text-primary mb-4">
        {title} · {monthShort(month)}
      </div>

      <div className="min-w-[320px]">
        <div className="flex pb-2.5 border-b border-border-default mb-2">
          {headers.map((h, i) => (
            <div
              key={h}
              className={[
                "text-[10px] font-semibold text-text-muted tracking-[0.07em]",
                i === 0 ? "flex-[2] text-left" : "flex-1 text-right",
              ].join(" ")}
            >
              {h}
            </div>
          ))}
        </div>

        {cats.map((row, i) => {
          const pctDiff =
            row.prevAmount > 0
              ? Math.round(((row.amount - row.prevAmount) / row.prevAmount) * 100)
              : null;

          return (
            <div
              key={i}
              className={[
                "flex items-center py-2.5",
                i < cats.length - 1 ? "border-b border-[#F8F8F4]" : "",
              ].join(" ")}
            >
              <div className="flex-[2] flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: row.color }}
                />
                <span className="text-[13px] font-medium text-[#333] truncate">
                  {row.name}
                </span>
              </div>

              {prev && (
                <div className="flex-1 text-right text-[12px] text-text-muted shrink-0">
                  {row.prevAmount > 0
                    ? formatRp(isExpense ? -row.prevAmount : row.prevAmount)
                    : "—"}
                </div>
              )}

              <div
                className={[
                  "flex-1 text-right text-[13px] font-semibold shrink-0",
                  amountColorClass,
                ].join(" ")}
              >
                {formatRp(isExpense ? -row.amount : row.amount)}
              </div>

              <div className="flex-1 text-right text-[12px] text-text-secondary shrink-0">
                {total > 0 ? Math.round((row.amount / total) * 100) : 0}%
              </div>

              {prev && (
                <div
                  className={[
                    "flex-1 text-right text-[12px] font-semibold shrink-0",
                    pctDiff == null
                      ? "text-text-muted"
                      : isExpense
                        ? pctDiff > 0
                          ? "text-text-expense"
                          : "text-text-income"
                        : pctDiff > 0
                          ? "text-text-income"
                          : "text-text-expense",
                  ].join(" ")}
                >
                  {pctDiff == null ? "new" : `${pctDiff > 0 ? "+" : ""}${pctDiff}%`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
