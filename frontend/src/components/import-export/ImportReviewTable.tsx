import { ReviewRow } from "@/types/import";
import { formatCurrency } from "@/utils/format";
import IconAlertCircle from "@/assets/icons/IconAlertCircle";
import IconCheckCircle from "@/assets/icons/IconCheckCircle";

const TABLE_HEADERS = [
  "",
  "Date",
  "Note",
  "Category",
  "Sub",
  "Amount",
  "Status",
];

interface ImportReviewTableProps {
  reviewRows: ReviewRow[];
  parseStage: "idle" | "preview" | "submitting" | "done";
  importResult: { imported: number; errors: number } | null;
  submitError: string;
  errCount: number;
  onImport: () => void;
  onReset: () => void;
}

export default function ImportReviewTable({
  reviewRows,
  parseStage,
  importResult,
  submitError,
  errCount,
  onImport,
  onReset,
}: ImportReviewTableProps) {
  const readyCount = reviewRows.filter((r) => r.status !== "error").length;

  return (
    <div>
      {/* Summary chips */}
      <div className="flex gap-2.5 mb-5">
        {[
          {
            label: "Total rows",
            val: reviewRows.length,
            color: "text-text-primary",
            bg: "bg-bg-primary",
          },
          {
            label: "Ready to import",
            val:
              parseStage === "done"
                ? (importResult?.imported ?? 0)
                : reviewRows.filter((r) => r.status !== "error").length,
            color: "text-text-income",
            bg: "bg-[#F0FDF5]",
          },
          {
            label: "Errors",
            val: parseStage === "done" ? (importResult?.errors ?? 0) : errCount,
            color: errCount > 0 ? "text-text-expense" : "text-text-income",
            bg: errCount > 0 ? "bg-surface-error" : "bg-[#F0FDF5]",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex-1 ${s.bg} rounded-[10px] px-[18px] py-3.5 border border-border-default`}
          >
            <div className={`text-[22px] font-bold ${s.color} tracking-tight`}>
              {s.val}
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[10px] border border-border-default">
        <div className="min-w-[560px]">
          {/* Header */}
          <div className="grid grid-cols-[32px_100px_1fr_120px_100px_80px_80px] bg-[#F8F8F5] px-3.5 py-[9px] border-b border-border-default">
            {TABLE_HEADERS.map((h, i) => (
              <div
                key={i}
                className={`text-[10px] font-semibold text-[#bbb] tracking-[0.07em] ${i >= 5 ? "text-right" : "text-left"}`}
              >
                {h}
              </div>
            ))}
          </div>

          {reviewRows.map((row, i) => {
            const isErr = row.status === "error";
            const isOk = row.status === "ok";
            const amtNum = parseFloat(row.amount);
            const isIncome = row.type === "income" || row.type === "inflow";
            const isLast = i === reviewRows.length - 1;

            return (
              <div key={i}>
                <div
                  className={[
                    "grid grid-cols-[32px_100px_1fr_120px_100px_80px_80px] px-3.5 py-[11px] items-center border-b border-[#F2F2EE]",
                    isErr
                      ? "bg-[#FFFAF9]"
                      : i % 2 === 0
                        ? "bg-surface-card"
                        : "bg-[#FAFAF7]",
                    parseStage === "done" && isErr ? "opacity-45" : "",
                    isLast ? "border-b-0" : "",
                  ].join(" ")}
                >
                  <div className="text-[11px] text-[#ccc] tabular-nums">
                    {i + 1}
                  </div>

                  <div
                    className={`text-xs tabular-nums ${isErr && !row.date ? "text-text-expense" : "text-[#555]"}`}
                  >
                    {row.date || (
                      <span className="text-text-expense italic">missing</span>
                    )}
                  </div>

                  <div className="text-xs text-[#333] overflow-hidden text-ellipsis whitespace-nowrap pr-3">
                    {row.note || "—"}
                  </div>

                  <div
                    className={`text-xs overflow-hidden text-ellipsis whitespace-nowrap ${isErr && !row.category ? "text-text-expense" : "text-[#444]"}`}
                  >
                    {row.category || (
                      <span className="italic text-text-expense">missing</span>
                    )}
                  </div>

                  <div className="text-[11px] text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap">
                    {row.sub_category || "—"}
                  </div>

                  <div
                    className={`text-xs font-bold text-right tabular-nums ${
                      isNaN(amtNum)
                        ? "text-text-expense"
                        : isIncome
                          ? "text-text-income"
                          : "text-text-expense"
                    }`}
                  >
                    {isNaN(amtNum) ? (
                      <span className="italic font-normal">invalid</span>
                    ) : (
                      formatCurrency(isIncome ? amtNum : -amtNum)
                    )}
                  </div>

                  <div className="flex justify-end">
                    {isErr ? (
                      <span className="text-[10px] font-bold text-text-expense bg-surface-error px-[9px] py-[3px] rounded-[10px] tracking-[0.04em]">
                        ERROR
                      </span>
                    ) : isOk ? (
                      <span className="text-[10px] font-bold text-text-income bg-[#F0FDF5] px-[9px] py-[3px] rounded-[10px] tracking-[0.04em]">
                        IMPORTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-text-secondary bg-[#F0F0EA] px-[9px] py-[3px] rounded-[10px] tracking-[0.04em]">
                        READY
                      </span>
                    )}
                  </div>
                </div>

                {/* Error detail row */}
                {isErr && (row.serverErrors ?? []).length > 0 && (
                  <div
                    className={[
                      "bg-[#FDF5F5] px-3.5 pt-1.5 pb-2 pl-[46px] flex gap-2 flex-wrap",
                      !isLast ? "border-b border-[#F2F2EE]" : "",
                    ].join(" ")}
                  >
                    {(row.serverErrors ?? []).map((e, ei) => (
                      <span
                        key={ei}
                        className="text-[11px] text-[#C04040] flex items-center gap-1"
                      >
                        <IconAlertCircle size={10} />
                        {e}
                        {ei < (row.serverErrors ?? []).length - 1 && (
                          <span className="text-[#ecc] ml-0.5">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Import button */}
      {parseStage === "preview" && (
        <div className="mt-5 flex items-center gap-3.5">
          <button
            onClick={onImport}
            disabled={readyCount === 0}
            className={[
              "px-8 py-3 rounded-[9px] border-none text-sm font-bold transition-colors",
              readyCount > 0
                ? "bg-bg-lime text-text-primary cursor-pointer hover:opacity-85"
                : "bg-[#F0F0EA] text-[#bbb] cursor-not-allowed",
            ].join(" ")}
          >
            Import {readyCount} Transaction{readyCount !== 1 ? "s" : ""}
          </button>
          {errCount > 0 && (
            <span className="text-xs text-[#bbb]">
              {errCount} row{errCount !== 1 ? "s" : ""} with errors will be
              skipped
            </span>
          )}
          {submitError && (
            <span className="text-xs text-text-expense">{submitError}</span>
          )}
        </div>
      )}

      {/* Submitting spinner */}
      {parseStage === "submitting" && (
        <div className="mt-5 flex items-center gap-3 text-[#bbb] text-sm">
          <div className="w-5 h-5 border-2 border-[#eee] border-t-bg-lime rounded-full animate-spin" />
          Importing transactions…
        </div>
      )}

      {/* Success banner */}
      {parseStage === "done" && importResult && (
        <div className="mt-5 px-5 py-4 rounded-[10px] bg-[#F0FDF5] border border-[#C4EDD6] flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-text-income flex items-center justify-center shrink-0">
            <IconCheckCircle />
          </div>
          <div>
            <div className="text-sm font-bold text-[#1a6640]">
              {importResult.imported} transaction
              {importResult.imported !== 1 ? "s" : ""} imported successfully
              {importResult.errors > 0 &&
                ` · ${importResult.errors} row${importResult.errors !== 1 ? "s" : ""} skipped`}
            </div>
            <div className="text-xs text-[#5aaa7a] mt-0.5">
              Your transactions are now visible in the Transactions page.
            </div>
          </div>
          <button
            onClick={onReset}
            className="ml-auto px-[18px] py-2 rounded-lg border-none bg-bg-lime text-text-primary text-xs font-bold cursor-pointer shrink-0 hover:opacity-85 transition-opacity"
          >
            Import More
          </button>
        </div>
      )}
    </div>
  );
}
