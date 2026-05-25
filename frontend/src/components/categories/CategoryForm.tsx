import { TransactionType } from "@/services/transaction-type.service";
import EmojiPicker from "@/components/ui/EmojiPicker";

interface CategoryFormProps {
  editName: string;
  editTypeId: string;
  editIcon: string | null;
  showIconPicker: boolean;
  types: TransactionType[];
  onNameChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onIconSelect: (emoji: string) => void;
  onIconClear: () => void;
  onToggleIconPicker: () => void;
  onCloseIconPicker: () => void;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-semibold text-text-muted tracking-[0.08em] mb-2.5 uppercase">
      {label}
    </div>
  );
}

export default function CategoryForm({
  editName,
  editTypeId,
  editIcon,
  showIconPicker,
  types,
  onNameChange,
  onTypeChange,
  onIconSelect,
  onIconClear,
  onToggleIconPicker,
  onCloseIconPicker,
}: CategoryFormProps) {
  return (
    <div className="flex flex-col gap-3 xs:flex-row xs:items-end xs:gap-3 mb-[26px]">
      {/* Icon + Name (always together) */}
      <div className="flex gap-3 items-end flex-[2] min-w-0">
        {/* Icon picker trigger */}
        <div className="relative shrink-0">
          <SectionLabel label="ICON" />
          <button
            onClick={onToggleIconPicker}
            className="w-[46px] h-[42px] rounded-lg border border-border-input bg-bg-white cursor-pointer text-[22px] flex items-center justify-center hover:bg-bg-primary transition-colors"
          >
            {editIcon ?? (
              <span className="text-[18px] text-text-muted">＋</span>
            )}
          </button>
          {editIcon && (
            <button
              onClick={onIconClear}
              className="absolute top-[22px] -right-1.5 w-4 h-4 rounded-full border-none bg-border-input text-text-secondary text-[9px] cursor-pointer flex items-center justify-center leading-none"
            >
              ✕
            </button>
          )}
          {showIconPicker && (
            <div className="absolute top-[70px] left-0">
              <EmojiPicker
                onSelect={onIconSelect}
                onClose={onCloseIconPicker}
              />
            </div>
          )}
        </div>

        {/* Name input */}
        <div className="flex-1 min-w-0">
          <SectionLabel label="CATEGORY NAME" />
          <input
            value={editName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-input text-sm text-text-primary outline-none focus:border-text-primary transition-colors font-medium"
          />
        </div>
      </div>

      {/* Type select */}
      <div className="xs:flex-1">
        <SectionLabel label="TYPE" />
        <select
          value={editTypeId}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border-input text-sm text-text-primary outline-none bg-bg-white cursor-pointer transition-colors"
        >
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
