const COLUMNS = [
  { col: "date", fmt: "YYYY-MM-DD", req: true, eg: "2026-05-01" },
  {
    col: "amount",
    fmt: "positive number (absolute value)",
    req: true,
    eg: "180000",
  },
  { col: "type", fmt: "income or expense", req: true, eg: "expense" },
  {
    col: "category",
    fmt: "must match a category name",
    req: true,
    eg: "Food & Drink",
  },
  {
    col: "sub_category",
    fmt: "must match a sub-category",
    req: false,
    eg: "Groceries",
  },
  { col: "note", fmt: "free text", req: false, eg: "Alfamart Citayam" },
] as const;

export default function ImportColumnReference() {
  return (
    <div>
      <div className="text-[11px] font-semibold text-[#ccc] tracking-[0.07em] uppercase mb-2.5">
        Column Reference
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {COLUMNS.map((c) => (
          <div
            key={c.col}
            className="bg-[#FAFAF8] rounded-lg p-[11px_14px] border border-border-default"
          >
            <div className="flex items-center justify-between mb-[5px]">
              <span className="text-xs font-bold text-text-primary">
                {c.col}
              </span>
              {c.req ? (
                <span className="text-[9px] font-bold text-text-expense bg-surface-error px-[7px] py-[2px] rounded-[10px] tracking-[0.04em]">
                  REQUIRED
                </span>
              ) : (
                <span className="text-[9px] text-[#bbb]">optional</span>
              )}
            </div>
            <div className="text-[11px] text-text-muted mb-1 leading-[1.4]">
              {c.fmt}
            </div>
            <div className="text-[11px] font-medium text-text-secondary bg-[#F0F0EC] rounded-[5px] py-[3px] px-2 inline-block tabular-nums">
              e.g. {c.eg}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
