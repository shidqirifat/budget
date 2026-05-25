import { BudgetEvent } from "@/services/event.service";

interface ExportFilterPanelProps {
  exportFrom: string;
  exportTo: string;
  exportEventId: string;
  events: BudgetEvent[];
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  onEventChange: (id: string) => void;
}

export default function ExportFilterPanel({
  exportFrom,
  exportTo,
  exportEventId,
  events,
  onFromChange,
  onToChange,
  onEventChange,
}: ExportFilterPanelProps) {
  return (
    <div className="bg-surface-card rounded-xl border border-border-default p-[22px] flex flex-col gap-5">
      <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] uppercase">
        Filters
      </div>

      {/* Date range */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold text-text-secondary tracking-[0.05em] uppercase">
          Date Range
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#bbb]">From</label>
            <input
              type="date"
              value={exportFrom}
              max={exportTo || undefined}
              onChange={(e) => onFromChange(e.target.value)}
              className={[
                "w-full px-2.5 py-2 rounded-lg text-xs text-text-primary bg-surface-card outline-none border-[1.5px] transition-colors",
                exportFrom ? "border-bg-lime" : "border-border-default",
              ].join(" ")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#bbb]">To</label>
            <input
              type="date"
              value={exportTo}
              min={exportFrom || undefined}
              onChange={(e) => onToChange(e.target.value)}
              className={[
                "w-full px-2.5 py-2 rounded-lg text-xs text-text-primary bg-surface-card outline-none border-[1.5px] transition-colors",
                exportTo ? "border-bg-lime" : "border-border-default",
              ].join(" ")}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-[#F0F0EC]" />

      {/* Event filter */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold text-text-secondary tracking-[0.05em] uppercase">
          Event
        </div>
        {events.length === 0 ? (
          <div className="text-xs text-[#ccc]">No events found.</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div
              onClick={() => onEventChange("")}
              className={[
                "px-3 py-2 rounded-lg cursor-pointer border-[1.5px] text-xs transition-all duration-100",
                !exportEventId
                  ? "border-bg-lime bg-surface-lime text-text-primary font-semibold"
                  : "border-border-default bg-surface-card text-text-secondary font-normal",
              ].join(" ")}
            >
              All events
            </div>
            {events.map((ev) => {
              const isActive = exportEventId === ev.id;
              return (
                <div
                  key={ev.id}
                  onClick={() => onEventChange(ev.id)}
                  className={[
                    "px-3 py-2 rounded-lg cursor-pointer border-[1.5px] transition-all duration-100",
                    isActive
                      ? "border-bg-lime bg-surface-lime"
                      : "border-border-default bg-surface-card",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "text-xs",
                      isActive
                        ? "font-semibold text-text-primary"
                        : "font-normal text-[#444]",
                    ].join(" ")}
                  >
                    {ev.name}
                  </div>
                  {ev.startDate && (
                    <div className="text-[10px] text-[#bbb] mt-0.5">
                      {ev.startDate.slice(0, 10)}
                      {ev.endDate ? ` → ${ev.endDate.slice(0, 10)}` : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
