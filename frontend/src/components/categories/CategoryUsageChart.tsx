import { CategoryStats } from "@/services/category.service";
import { formatCurrency as formatRp } from "@/utils/format";

interface CategoryUsageChartProps {
  stats: CategoryStats | null;
  typeName: "income" | "expense";
}

function MiniBar({ stats }: { stats: CategoryStats | null }) {
  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-[11px] text-text-muted">Loading…</span>
      </div>
    );
  }
  const max = Math.max(...stats.months.map((m) => m.total), 1);
  return (
    <div className="flex-1">
      <div className="flex items-end gap-2 h-11">
        {stats.months.map((m, i) => {
          const isLast = i === stats.months.length - 1;
          const heightPct = Math.max((m.total / max) * 44, m.total > 0 ? 4 : 0);
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-[3px] ${isLast ? "bg-bg-lime" : "bg-neutral-200"}`}
              style={{ height: heightPct }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        {stats.months.map((m, i) => {
          const isLast = i === stats.months.length - 1;
          return (
            <span
              key={i}
              className={`text-[10px] ${isLast ? "text-text-secondary font-bold" : "text-text-muted font-normal"}`}
            >
              {m.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function CategoryUsageChart({
  stats,
  typeName,
}: CategoryUsageChartProps) {
  const amountColor =
    typeName === "income" ? "text-text-income" : "text-text-expense";
  const month = new Date().toLocaleString("en-US", { month: "long" });

  return (
    <div className="bg-bg-primary rounded-[10px] px-5 py-[18px] mb-6 border border-border-default">
      <div className="text-[10px] font-semibold text-text-muted tracking-[0.08em] mb-2.5 uppercase">
        USAGE THIS MONTH
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-wrap">
        <div>
          <div
            className={`text-[22px] font-bold tracking-tight ${amountColor}`}
          >
            {stats ? formatRp(stats.currentMonthTotal) : "—"}
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            Total {typeName} · {month}
          </div>
        </div>
        <MiniBar stats={stats} />
      </div>
    </div>
  );
}
