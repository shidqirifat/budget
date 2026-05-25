import dayjs from "@/utils/dayjs";
import { BudgetEvent } from "@/services/event.service";

interface Props {
  event: BudgetEvent;
  isSelected: boolean;
  onClick: (id: string) => void;
}

function formatDateLabel(d: string) {
  if (!d) return "—";
  return dayjs(d.slice(0, 10)).format("D MMM YYYY");
}

export default function EventListItem({ event, isSelected, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(event.id)}
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-border-default border-l-[3px] transition-colors ${
        isSelected
          ? "bg-surface-lime border-l-bg-lime"
          : "bg-bg-white border-l-transparent hover:bg-bg-primary"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div
          className={`text-[13px] truncate ${isSelected ? "font-bold text-text-primary" : "font-medium text-text-primary"}`}
        >
          {event.name}
        </div>
        <div className="text-[10px] text-text-muted mt-0.5">
          {formatDateLabel(event.startDate)} –{" "}
          {event.endDate ? formatDateLabel(event.endDate) : "ongoing"}
        </div>
      </div>
    </div>
  );
}
