import { Transaction } from "@/services/transaction.service";
import EventTransactionRow from "./EventTransactionRow";

interface Props {
  transactions: Transaction[];
  loading: boolean;
  emptyMessage: string;
  actionLabel: string;
  variant: "link" | "unlink";
  borderStyle: "solid" | "dashed";
  onAction: (id: string) => void;
}

export default function EventTransactionList({
  transactions,
  loading,
  emptyMessage,
  actionLabel,
  variant,
  borderStyle,
  onAction,
}: Props) {
  const borderClass =
    borderStyle === "dashed"
      ? "border-[1.5px] border-dashed border-bg-lime bg-bg-primary"
      : "border border-border-default bg-bg-white";

  return (
    <div className={`rounded-[10px] overflow-hidden ${borderClass}`}>
      {loading ? (
        <div className="p-5 text-center text-text-muted text-xs">Loading…</div>
      ) : transactions.length === 0 ? (
        <div className="p-5 text-center text-text-muted text-xs italic">
          {emptyMessage}
        </div>
      ) : (
        transactions.map((tx, i) => (
          <EventTransactionRow
            key={tx.id}
            tx={tx}
            index={i}
            actionLabel={actionLabel}
            variant={variant}
            onAction={onAction}
          />
        ))
      )}
    </div>
  );
}
