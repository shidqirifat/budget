import { Category, SubCategory } from "@/services/category.service";
import { BudgetEvent } from "@/services/event.service";
import CategoryPicker from "./CategoryPicker";
import IconAlertCircle from "@/assets/icons/IconAlertCircle";

interface Props {
  isMobile: boolean;
  typeName: "income" | "expense";
  amount: string;
  date: string;
  catId: string;
  subCatId: string;
  note: string;
  eventId: string;
  amountError: string;
  categoryError: string;
  categories: Category[];
  subCats: SubCategory[];
  events: BudgetEvent[];
  amountRef: React.RefObject<HTMLInputElement>;
  categoryRef: React.RefObject<HTMLDivElement>;
  onTypeChange: (t: "income" | "expense") => void;
  onAmountChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onCatChange: (id: string) => void;
  onSubCatChange: (id: string) => void;
  onNoteChange: (v: string) => void;
  onEventChange: (id: string) => void;
}

export default function TransactionFormFields({
  isMobile,
  typeName,
  amount,
  date,
  catId,
  subCatId,
  note,
  eventId,
  amountError,
  categoryError,
  categories,
  subCats,
  events,
  amountRef,
  categoryRef,
  onTypeChange,
  onAmountChange,
  onDateChange,
  onCatChange,
  onSubCatChange,
  onNoteChange,
  onEventChange,
}: Props) {
  const amtColorClass = typeName === "income" ? "text-text-income" : "text-text-expense";

  const activeEvents = events.filter((ev) => {
    const start = ev.startDate.slice(0, 10);
    const end = ev.endDate ? ev.endDate.slice(0, 10) : "";
    const today = new Date().toISOString().slice(0, 10);
    return start <= today && (!end || today <= end);
  });

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4">
      {/* Type + Amount */}
      <div className={`bg-bg-white rounded-xl border border-border-default ${isMobile ? "p-4" : "p-6"}`}>
        {/* Type toggle */}
        <div className="flex bg-bg-primary rounded-lg p-1 w-fit mb-5">
          {(["expense", "income"] as const).map((t) => {
            const sel = typeName === t;
            return (
              <button
                key={t}
                onClick={() => onTypeChange(t)}
                className={`px-5 py-2 rounded-md border-none cursor-pointer text-[13px] transition-all duration-100
                  ${sel
                    ? t === "income"
                      ? "bg-emerald-50 text-text-income font-bold"
                      : "bg-red-50 text-text-expense font-bold"
                    : "bg-transparent text-text-secondary font-normal"
                  }`}
              >
                {t === "income" ? "Inflow" : "Outflow"}
              </button>
            );
          })}
        </div>

        {/* Amount label */}
        <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] mb-2.5">AMOUNT</div>

        <div className="flex items-baseline gap-2">
          <span className={`font-bold text-text-muted ${isMobile ? "text-xl" : "text-[26px]"}`}>
            {typeName === "expense" ? "-" : "+"} Rp
          </span>
          <input
            ref={amountRef}
            value={amount ? parseInt(amount).toLocaleString("id-ID") : ""}
            onChange={(e) => onAmountChange(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className={`border-none outline-none bg-transparent w-full tracking-tight font-bold
              ${isMobile ? "text-[28px]" : "text-[34px]"}
              ${amountError ? "text-text-expense" : amtColorClass}`}
          />
        </div>

        {amountError && (
          <div className="mt-2 text-xs text-text-expense flex items-center gap-1">
            <IconAlertCircle />
            {amountError}
          </div>
        )}
      </div>

      {/* Date */}
      <div className={`bg-bg-white rounded-xl border border-border-default ${isMobile ? "p-4" : "p-6"}`}>
        <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] mb-2.5">DATE</div>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className={`text-sm font-medium border border-border-input rounded-lg px-3.5 py-2.5 text-text-primary bg-neutral-50 outline-none cursor-pointer ${isMobile ? "w-full box-border" : ""}`}
        />
      </div>

      {/* Category */}
      <CategoryPicker
        categories={categories}
        subCats={subCats}
        catId={catId}
        subCatId={subCatId}
        categoryError={categoryError}
        onSelectCat={onCatChange}
        onSelectSubCat={onSubCatChange}
        categoryRef={categoryRef}
      />

      {/* Note + Event */}
      <div className={`bg-bg-white rounded-xl border border-border-default ${isMobile ? "p-4 flex flex-col gap-4" : "p-6 flex flex-row gap-5"}`}>
        <div className="flex-[2]">
          <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] mb-2.5">NOTE</div>
          <input
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Add a note…"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-input text-sm text-text-primary outline-none box-border"
          />
        </div>
        <div className={isMobile ? "" : "flex-1"}>
          <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] mb-2.5 flex items-center gap-2">
            LINK EVENT
            <span className="font-normal text-neutral-300 tracking-normal text-[11px]">(optional)</span>
          </div>
          <select
            value={eventId}
            onChange={(e) => onEventChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border border-border-input text-sm outline-none bg-bg-white box-border ${eventId ? "text-text-primary" : "text-text-muted"}`}
          >
            <option value="">No event</option>
            {activeEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
