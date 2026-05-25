import IconDownload from "@/assets/icons/IconDownload";
import { BudgetEvent } from "@/services/event.service";

const FORMAT_OPTIONS = [
  {
    fmt: "csv" as const,
    label: "CSV",
    desc: "Spreadsheet-compatible. Open in Excel, Google Sheets, etc.",
    icon: "📊",
  },
  {
    fmt: "json" as const,
    label: "JSON",
    desc: "Raw data export for developers or custom tools.",
    icon: "{ }",
  },
];

interface ExportFormatCardsProps {
  exportFormat: "csv" | "json";
  exporting: boolean;
  exportFrom: string;
  exportTo: string;
  exportEventId: string;
  events: BudgetEvent[];
  onExport: (fmt: "csv" | "json") => void;
  onFormatHover: (fmt: "csv" | "json") => void;
  onResetFilters: () => void;
}

export default function ExportFormatCards({
  exportFormat,
  exporting,
  exportFrom,
  exportTo,
  exportEventId,
  events,
  onExport,
  onFormatHover,
  onResetFilters,
}: ExportFormatCardsProps) {
  const hasFilters = !!(exportFrom || exportTo || exportEventId);

  return (
    <div className="bg-surface-card rounded-xl p-6 border border-border-default flex flex-col gap-5">
      <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] uppercase">
        Export Transactions
      </div>

      <div className="flex flex-col gap-3">
        {FORMAT_OPTIONS.map((opt) => {
          const isActive = exportFormat === opt.fmt;
          return (
            <div
              key={opt.fmt}
              onClick={() => onExport(opt.fmt)}
              onMouseEnter={() => onFormatHover(opt.fmt)}
              className={[
                "flex items-center gap-4 p-[18px_20px] rounded-[10px] border-[1.5px] bg-[#FAFAF8] transition-colors duration-100",
                isActive
                  ? "border-bg-lime"
                  : "border-border-default hover:border-bg-lime",
                exporting ? "cursor-wait" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="w-11 h-11 bg-dark rounded-[10px] flex items-center justify-center text-base shrink-0 text-bg-lime font-bold font-mono">
                {opt.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-text-primary">
                  {opt.label}
                </div>
                <div className="text-xs text-text-muted mt-0.5">{opt.desc}</div>
              </div>
              {exporting ? (
                <div className="w-[18px] h-[18px] border-2 border-[#eee] border-t-bg-lime rounded-full animate-spin shrink-0" />
              ) : (
                <IconDownload className="opacity-30 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {hasFilters ? (
        <div className="bg-bg-primary rounded-lg px-3.5 py-2.5 text-xs text-text-secondary flex items-center gap-2 flex-wrap">
          <span className="text-[#555] font-semibold">Filters applied:</span>
          {exportFrom && <span>From {exportFrom}</span>}
          {exportTo && <span>To {exportTo}</span>}
          {exportEventId && (
            <span>
              Event: {events.find((e) => e.id === exportEventId)?.name}
            </span>
          )}
          <button
            onClick={onResetFilters}
            className="ml-auto bg-transparent border-none cursor-pointer text-[11px] text-[#bbb] p-0 hover:text-text-secondary transition-colors"
          >
            Clear all
          </button>
        </div>
      ) : (
        <div className="text-xs text-[#ccc] bg-[#F8F8F5] rounded-lg px-4 py-3">
          No filters — exports all your transactions across all months.
        </div>
      )}
    </div>
  );
}
