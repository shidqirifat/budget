import { BudgetEvent } from "@/services/event.service";
import EventListItem from "./EventListItem";
import EventAddForm from "./EventAddForm";

interface Props {
  events: BudgetEvent[];
  visibleEvents: BudgetEvent[];
  activeTab: "active" | "inactive";
  selectedId: string | null;
  showAdd: boolean;
  newName: string;
  newStart: string;
  newEnd: string;
  newNote: string;
  saving: boolean;
  onTabChange: (tab: "active" | "inactive") => void;
  onSelectEvent: (id: string) => void;
  onChangeName: (v: string) => void;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  onChangeNote: (v: string) => void;
  onSaveAdd: () => void;
  onCancelAdd: () => void;
  isActive: (ev: BudgetEvent) => boolean;
}

export default function EventList({
  events,
  visibleEvents,
  activeTab,
  selectedId,
  showAdd,
  newName,
  newStart,
  newEnd,
  newNote,
  saving,
  onTabChange,
  onSelectEvent,
  onChangeName,
  onChangeStart,
  onChangeEnd,
  onChangeNote,
  onSaveAdd,
  onCancelAdd,
  isActive,
}: Props) {
  return (
    <div className="w-full md:w-[264px] shrink-0 bg-bg-white rounded-xl border border-border-default flex flex-col overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex border-b border-border-default shrink-0">
        {(["active", "inactive"] as const).map((tab) => {
          const label = tab === "active" ? "Active" : "Inactive";
          const count = events.filter((e) =>
            tab === "active" ? isActive(e) : !isActive(e),
          ).length;
          const isSelected = activeTab === tab;
          return (
            <div
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 py-3 text-center cursor-pointer border-b-[2.5px] transition-all ${
                isSelected
                  ? "border-b-bg-lime bg-surface-lime"
                  : "border-b-transparent bg-bg-white"
              }`}
            >
              <span
                className={`text-[13px] ${isSelected ? "font-bold text-text-primary" : "font-normal text-text-muted"}`}
              >
                {label}
              </span>
              <span
                className={`ml-1.5 text-[11px] px-1.5 py-px rounded-full font-semibold ${
                  isSelected
                    ? "bg-bg-lime text-text-primary"
                    : "bg-bg-primary text-text-muted"
                }`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>

      <div className="overflow-y-auto flex-1">
        {visibleEvents.length === 0 && !showAdd && (
          <div className="px-4 py-7 text-center text-text-muted text-xs italic">
            No {activeTab} events
          </div>
        )}
        {visibleEvents.map((ev) => (
          <EventListItem
            key={ev.id}
            event={ev}
            isSelected={selectedId === ev.id}
            onClick={onSelectEvent}
          />
        ))}
        {showAdd && (
          <EventAddForm
            name={newName}
            startDate={newStart}
            endDate={newEnd}
            description={newNote}
            saving={saving}
            onChangeName={onChangeName}
            onChangeStart={onChangeStart}
            onChangeEnd={onChangeEnd}
            onChangeDescription={onChangeNote}
            onSave={onSaveAdd}
            onCancel={onCancelAdd}
          />
        )}
      </div>
    </div>
  );
}
