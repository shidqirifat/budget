import { Transaction } from "@/services/transaction.service";
import { TransactionGroup } from "@/hooks/useTransactionList";
import { formatCurrency } from "@/utils/format";
import TransactionRow from "./TransactionRow";

interface Props {
  groups: TransactionGroup[];
  loading: boolean;
  onTransactionClick: (tx: Transaction) => void;
}

export default function TransactionList({ groups, loading, onTransactionClick }: Props) {
  if (loading) {
    return (
      <div className="text-center py-[60px] text-text-muted text-sm">Loading…</div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-[60px] text-text-muted text-sm">No transactions found.</div>
    );
  }

  return (
    <>
      {groups.map((group) => (
        <div
          key={group.date}
          className="mb-3 rounded-[10px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        >
          {/* Date header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-border-default">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[26px] font-bold text-text-primary tracking-tight">
                {String(group.day).padStart(2, "0")}
              </span>
              <div>
                <div className="text-xs font-semibold text-text-secondary">{group.dayName}</div>
                <div className="text-[11px] text-text-muted">{group.monthName} {group.year}</div>
              </div>
            </div>
            <span
              className={`text-sm font-bold ${group.dayTotal < 0 ? "text-text-expense" : "text-text-income"}`}
            >
              {group.dayTotal < 0 ? "-" : "+"}
              {formatCurrency(Math.abs(group.dayTotal))}
            </span>
          </div>

          {/* Transaction rows */}
          {group.transactions.map((tx, i) => (
            <div
              key={tx.id}
              className={i < group.transactions.length - 1 ? "border-b border-[#F2F2EE]" : ""}
            >
              <TransactionRow
                transaction={tx}
                index={i}
                onClick={onTransactionClick}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
