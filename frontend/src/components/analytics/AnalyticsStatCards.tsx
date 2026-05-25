import { formatRp } from "@/utils/designData";
import { monthShort } from "@/utils/analytics";
import { AnalyticsMonthly } from "@/services/transaction.service";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}

function StatCard({ label, value, sub, valueClass }: StatCardProps) {
  return (
    <div className="bg-bg-white rounded-xl px-4 sm:px-[22px] py-4 sm:py-[18px] border border-border-default flex-1 min-w-0">
      <div className="text-[10px] font-semibold text-text-muted tracking-[0.07em] mb-2">
        {label}
      </div>
      <div
        className={[
          "text-[16px] sm:text-[20px] font-bold tracking-[-0.02em] truncate",
          valueClass ?? "text-text-primary",
        ].join(" ")}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-text-muted mt-1 truncate">{sub}</div>
      )}
    </div>
  );
}

interface AnalyticsStatCardsProps {
  inflow: number;
  outflow: number;
  net: number;
  savingsRate: number;
  diffInflow: number;
  diffOutflow: number;
  pctInflow: number;
  pctOutflow: number;
  prev: AnalyticsMonthly | undefined;
}

export default function AnalyticsStatCards({
  inflow,
  outflow,
  net,
  savingsRate,
  diffInflow,
  diffOutflow,
  pctInflow,
  pctOutflow,
  prev,
}: AnalyticsStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 mb-3 sm:mb-4 lg:mb-5">
      <StatCard
        label="INFLOW"
        value={formatRp(inflow)}
        sub={
          prev
            ? `${diffInflow >= 0 ? "+" : "-"}${pctInflow}% vs ${monthShort(prev.month)}`
            : "No prev month"
        }
        valueClass="text-text-income"
      />
      <StatCard
        label="OUTFLOW"
        value={formatRp(-outflow)}
        sub={
          prev
            ? `${diffOutflow >= 0 ? "+" : "-"}${pctOutflow}% vs ${monthShort(prev.month)}`
            : "No prev month"
        }
        valueClass="text-text-expense"
      />
      <StatCard
        label="NET"
        value={formatRp(net)}
        sub={net >= 0 ? "Positive cash flow ✓" : "Negative cash flow ✗"}
        valueClass={net >= 0 ? "text-text-primary" : "text-text-expense"}
      />
      <StatCard
        label="SAVINGS RATE"
        value={`${savingsRate}%`}
        sub={savingsRate >= 30 ? "Target: 30% ✓" : "Below 30% target"}
        valueClass="text-bg-lime"
      />
    </div>
  );
}
