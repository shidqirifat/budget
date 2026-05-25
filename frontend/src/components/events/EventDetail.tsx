import dayjs from "@/utils/dayjs";
import { formatCurrency } from "@/utils/format";
import { BudgetEvent } from "@/services/event.service";
import { Transaction } from "@/services/transaction.service";
import EventImpactCards from "./EventImpactCards";
import EventContributionBar from "./EventContributionBar";
import EventTransactionList from "./EventTransactionList";

interface Props {
  selected: BudgetEvent;
  linkedTxs: Transaction[];
  recommendedTxs: Transaction[];
  loadingTxs: boolean;
  eventTotal: number;
  eventOutflow: number;
  monthOutflow: number;
  contributionPct: number;
  isMobile: boolean;
  onDelete: () => void;
  onLink: (id: string) => void;
  onUnlink: (id: string) => void;
}

function formatDateLabel(d: string) {
  if (!d) return "—";
  return dayjs(d.slice(0, 10)).format("D MMMM YYYY");
}

export default function EventDetail({
  selected,
  linkedTxs,
  recommendedTxs,
  loadingTxs,
  eventTotal,
  eventOutflow,
  monthOutflow,
  contributionPct,
  isMobile,
  onDelete,
  onLink,
  onUnlink,
}: Props) {
  const impactCards = [
    {
      label: "MONTH OUTFLOW",
      value: formatCurrency(monthOutflow),
      valueClass: "text-text-secondary",
    },
    {
      label: "EVENT SPEND",
      value: formatCurrency(eventOutflow),
      valueClass: "text-text-expense",
    },
    {
      label: "CONTRIBUTION",
      value: `${contributionPct}%`,
      valueClass: "text-accent-amber",
      sub: `of ${dayjs(selected.startDate.slice(0, 10)).format("MMMM")} outflow`,
    },
  ];

  return (
    <>
      <div
        className={`flex flex-col xs:flex-row xs:items-center gap-4 border-b border-border-default shrink-0 ${isMobile ? "px-5 py-4" : "px-7 py-[22px]"}`}
      >
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text-primary tracking-tight m-0">
            {selected.name}
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {formatDateLabel(selected.startDate)} –{" "}
            {selected.endDate ? formatDateLabel(selected.endDate) : "ongoing"} ·{" "}
            {linkedTxs.length} linked
          </p>
        </div>
        <div className="sm:text-right">
          <div className="text-[10px] font-semibold text-text-muted tracking-[0.07em] uppercase mb-1">
            TOTAL IMPACT
          </div>
          <div
            className={`text-xl font-bold tracking-tight ${eventTotal >= 0 ? "text-text-income" : "text-text-expense"}`}
          >
            {eventTotal >= 0 ? "+" : ""}
            {formatCurrency(Math.abs(eventTotal))}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="px-3.5 py-2 rounded-lg border border-border-default bg-surface-error text-text-expense text-xs cursor-pointer shrink-0"
        >
          Delete
        </button>
      </div>

      <div
        className={`flex-1 overflow-y-auto ${isMobile ? "px-5 py-4" : "px-7 py-6"}`}
      >
        {selected.description && (
          <div className="mb-[22px]">
            <SectionHead label="DESCRIPTION" />
            <div className="px-4 py-3 bg-bg-primary rounded-lg border border-border-default text-[13px] text-text-secondary leading-relaxed">
              {selected.description}
            </div>
          </div>
        )}

        <div className="mb-[22px]">
          <SectionHead label="IMPACT ANALYSIS" />
          <EventImpactCards cards={impactCards} />
          {monthOutflow > 0 && (
            <EventContributionBar contributionPct={contributionPct} />
          )}
        </div>

        <div className="mb-[22px]">
          <SectionHead label={`LINKED TRANSACTIONS (${linkedTxs.length})`} />
          <EventTransactionList
            transactions={linkedTxs}
            loading={loadingTxs}
            emptyMessage="No transactions linked yet"
            actionLabel="Unlink"
            variant="unlink"
            borderStyle="solid"
            onAction={onUnlink}
          />
        </div>

        {!loadingTxs && recommendedTxs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <SectionHead label="RECOMMENDED TO LINK" />
              <span className="px-2 py-0.5 rounded-full bg-bg-primary border border-border-default text-[10px] text-text-secondary font-semibold mb-2.5">
                {recommendedTxs.length} match date range
              </span>
            </div>
            <EventTransactionList
              transactions={recommendedTxs}
              loading={false}
              emptyMessage=""
              actionLabel="Link"
              variant="link"
              borderStyle="dashed"
              onAction={onLink}
            />
          </div>
        )}

        {!loadingTxs && recommendedTxs.length === 0 && linkedTxs.length > 0 && (
          <div className="p-3.5 bg-bg-primary rounded-lg text-xs text-text-muted text-center italic">
            No more transactions in this date range to link
          </div>
        )}
      </div>
    </>
  );
}

function SectionHead({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-2.5">
      {label}
    </div>
  );
}
