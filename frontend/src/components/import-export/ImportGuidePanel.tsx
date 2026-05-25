const STEPS = [
  {
    n: "1",
    title: "Download the template",
    body: "Use the CSV template so your columns match exactly. Do not rename headers.",
  },
  {
    n: "2",
    title: "Fill in your data",
    body: "Add one transaction per row. Dates must be YYYY-MM-DD. Amounts are positive numbers.",
  },
  {
    n: "3",
    title: "Set the type",
    body: 'Use "income" or "expense" in the type column to classify each transaction.',
  },
  {
    n: "4",
    title: "Check categories",
    body: "Category and sub_category must exactly match names in your Budget app.",
  },
  {
    n: "5",
    title: "Upload & review",
    body: "Drop your file in the upload zone. Rows with errors are highlighted — fix them and re-upload.",
  },
] as const;

interface ImportGuidePanelProps {
  expenseCategories: string[];
  incomeCategories: string[];
}

export default function ImportGuidePanel({
  expenseCategories,
  incomeCategories,
}: ImportGuidePanelProps) {
  return (
    <div className="bg-dark rounded-xl p-[22px] overflow-y-auto flex-1">
      <div className="text-sm font-bold text-bg-lime mb-1">Import Guide</div>
      <div className="text-xs text-text-secondary mb-5 leading-relaxed">
        Follow these steps to import your transactions without errors.
      </div>

      {STEPS.map((step) => (
        <div
          key={step.n}
          className="mb-5 pb-5 border-b border-[#1e1e1e] flex gap-3 items-start last:border-b-0 last:mb-0 last:pb-0"
        >
          <div className="w-6 h-6 rounded-full bg-[#1e2d00] flex items-center justify-center text-[11px] font-extrabold text-bg-lime shrink-0 mt-px">
            {step.n}
          </div>
          <div>
            <div className="text-xs font-bold text-[#ccc] mb-1">{step.title}</div>
            <div className="text-[11px] text-text-secondary leading-relaxed">
              {step.body}
            </div>
          </div>
        </div>
      ))}

      {expenseCategories.length > 0 && (
        <>
          <div className="text-[10px] font-semibold text-[#777] tracking-[0.07em] uppercase mb-2.5 mt-5">
            Expense Categories
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {expenseCategories.map((c) => (
              <div
                key={c}
                className="px-[9px] py-1 rounded-full bg-[#1e1e1e] text-[11px] text-text-muted"
              >
                {c}
              </div>
            ))}
          </div>
        </>
      )}

      {incomeCategories.length > 0 && (
        <>
          <div className="text-[10px] font-semibold text-[#777] tracking-[0.07em] uppercase mb-2.5">
            Income Categories
          </div>
          <div className="flex flex-wrap gap-1.5">
            {incomeCategories.map((c) => (
              <div
                key={c}
                className="px-[9px] py-1 rounded-full bg-[#1e1e1e] text-[11px] text-text-muted"
              >
                {c}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
