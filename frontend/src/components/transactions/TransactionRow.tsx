import { Transaction } from "@/services/transaction.service";
import { formatCurrency } from "@/utils/format";
import Badge from "@/components/ui/Badge";

interface Props {
  transaction: Transaction;
  index: number;
  onClick: (tx: Transaction) => void;
}

function txSignedAmount(tx: Transaction): number {
  return tx.type.name === "income" ? tx.amount : -tx.amount;
}

export default function TransactionRow({ transaction: tx, index, onClick }: Props) {
  const signed = txSignedAmount(tx);
  const isEven = index % 2 === 0;

  return (
    <div
      onClick={() => onClick(tx)}
      className={`flex items-center gap-3 px-4 py-[13px] cursor-pointer transition-colors hover:bg-green-50
        ${isEven ? "bg-bg-white" : "bg-[#FAFAF7]"}`}
    >
      {/* Category avatar */}
      <div className="w-9 h-9 rounded-full bg-border-default flex items-center justify-center text-sm font-bold text-text-secondary shrink-0">
        {tx.category.name.slice(0, 1).toUpperCase()}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text-primary">{tx.category.name}</div>

        {/* Badges — mobile only (below category name) */}
        {(tx.subCategory || tx.event) && (
          <div className="flex gap-1 flex-wrap mt-0.5 mb-1 md:hidden">
            {tx.subCategory && (
              <Badge variant="default">{tx.subCategory.name}</Badge>
            )}
            {tx.event && (
              <Badge variant="event">{tx.event.name}</Badge>
            )}
          </div>
        )}

        <div className="text-xs text-text-secondary truncate">{tx.note || "—"}</div>
      </div>

      {/* Badges — desktop only (between info and amount) */}
      {(tx.subCategory || tx.event) && (
        <div className="hidden md:flex gap-1.5 shrink-0">
          {tx.subCategory && (
            <Badge variant="default">{tx.subCategory.name}</Badge>
          )}
          {tx.event && (
            <Badge variant="event">{tx.event.name}</Badge>
          )}
        </div>
      )}

      {/* Amount */}
      <div
        className={`text-sm font-bold shrink-0 min-w-[140px] text-right tracking-tight max-sm:min-w-0 max-sm:text-[13px]
          ${signed < 0 ? "text-text-expense" : "text-text-income"}`}
      >
        {signed < 0 ? "-" : "+"}
        {formatCurrency(Math.abs(signed))}
      </div>
    </div>
  );
}
