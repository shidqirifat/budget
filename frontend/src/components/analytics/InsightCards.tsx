import { formatRp } from "@/utils/designData";
import {
  AnalyticsInsights,
  AnalyticsEventSummary,
} from "@/services/transaction.service";

interface InsightRow {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accentClass: string;
  truncate?: boolean;
}

function InsightCard({ icon, label, value, sub, accentClass, truncate }: InsightRow) {
  return (
    <div className="p-[10px_14px] bg-[#FAFAFA] rounded-[10px] border border-border-default min-w-0">
      <div className="text-[10px] text-text-muted font-semibold tracking-[0.07em] mb-1">
        {icon} {label}
      </div>
      <div
        className={[
          "text-[13px] font-bold",
          accentClass,
          truncate ? "truncate" : "",
        ].join(" ")}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

interface InsightCardsProps {
  insights: AnalyticsInsights;
  eventSummary: AnalyticsEventSummary | null | undefined;
}

export default function InsightCards({ insights, eventSummary }: InsightCardsProps) {
  const rows: InsightRow[] = [];

  if (insights.mostExpenseCategory)
    rows.push({
      icon: "💸",
      label: "MOST EXPENSE",
      value: insights.mostExpenseCategory.name,
      sub: formatRp(-insights.mostExpenseCategory.amount),
      accentClass: "text-text-expense",
    });

  if (insights.mostFrequentExpense)
    rows.push({
      icon: "🔁",
      label: "MOST FREQUENT",
      value: insights.mostFrequentExpense.name,
      sub: `${insights.mostFrequentExpense.count} tx`,
      accentClass: "text-[#E8A040]",
    });

  if (insights.mostIncomeCategory)
    rows.push({
      icon: "💰",
      label: "TOP INCOME",
      value: insights.mostIncomeCategory.name,
      sub: formatRp(insights.mostIncomeCategory.amount),
      accentClass: "text-text-income",
    });

  const hasDiffs =
    insights.expenseDiff.length > 0 || insights.incomeDiff.length > 0;

  if (!rows.length && !eventSummary && !hasDiffs) return null;

  return (
    <div className="flex flex-col gap-2">
      {rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {rows.map((r, i) => (
            <InsightCard key={i} {...r} />
          ))}
        </div>
      )}

      {eventSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <InsightCard
            icon="📅"
            label="RUNNING EVENTS"
            value={String(eventSummary.runningEventCount)}
            sub={
              eventSummary.runningEventCount === 0
                ? "No active events"
                : "active this month"
            }
            accentClass="text-[#5C8AE0]"
          />
          <InsightCard
            icon="🏆"
            label="MOST EXPENSIVE EVENT"
            value={eventSummary.mostExpensiveEvent?.name ?? "—"}
            sub={
              eventSummary.mostExpensiveEvent
                ? formatRp(-eventSummary.mostExpensiveEvent.total)
                : "No events"
            }
            accentClass="text-[#A05CE0]"
            truncate
          />
        </div>
      )}
    </div>
  );
}
