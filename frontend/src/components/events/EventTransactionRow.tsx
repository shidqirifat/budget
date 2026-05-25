import dayjs from "@/utils/dayjs";
import { formatCurrency } from "@/utils/format";
import { Transaction } from "@/services/transaction.service";

interface Props {
  tx: Transaction;
  index: number;
  actionLabel: string;
  variant: "link" | "unlink";
  onAction: (id: string) => void;
}

export default function EventTransactionRow({
  tx,
  index,
  actionLabel,
  variant,
  onAction,
}: Props) {
  const isIncome = tx.type.name === "income";
  const amountClass = isIncome ? "text-text-income" : "text-text-expense";
  const rowBg = index % 2 === 0 ? "bg-bg-white" : "bg-bg-primary";
  const btnClass =
    variant === "unlink"
      ? "bg-surface-error text-text-expense border border-border-default"
      : "bg-bg-lime text-text-primary border-0";

  return (
    <div
      className={`flex flex-col xs:flex-row xs:items-center gap-3.5 px-4 py-3 border-b border-border-default ${rowBg}`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-text-primary truncate">
          {tx.note || "—"}
        </div>
        <div className="text-[11px] text-text-muted mt-0.5">
          {dayjs(tx.date.slice(0, 10)).format("D MMM YYYY")} ·{" "}
          {tx.category.name}
          {tx.subCategory ? ` / ${tx.subCategory.name}` : ""}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className={`text-[13px] font-bold shrink-0 ${amountClass}`}>
          {isIncome ? "+" : "-"}
          {formatCurrency(tx.amount)}
        </span>
        <button
          onClick={() => onAction(tx.id)}
          className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer shrink-0 ${btnClass}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
