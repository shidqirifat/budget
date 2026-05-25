import { SubCategory } from "@/services/category.service";
import SubCategoryRow from "./SubCategoryRow";
import EmojiPicker from "@/components/ui/EmojiPicker";

interface SubCategoryListProps {
  subs: SubCategory[];
  editingSubId: string | null;
  editingSubName: string;
  editingSubIcon: string | null;
  showSubIconPicker: boolean;
  newSub: string;
  newSubIcon: string | null;
  showNewSubIconPicker: boolean;
  onEditingNameChange: (v: string) => void;
  onEditingIconSelect: (emoji: string) => void;
  onToggleSubIconPicker: () => void;
  onCloseSubIconPicker: () => void;
  onStartEdit: (sub: SubCategory) => void;
  onSaveEdit: (sub: SubCategory) => void;
  onCancelEdit: () => void;
  onDelete: (sub: SubCategory) => void;
  onNewSubChange: (v: string) => void;
  onNewSubIconSelect: (emoji: string) => void;
  onToggleNewSubIconPicker: () => void;
  onCloseNewSubIconPicker: () => void;
  onAddSub: () => void;
}

export default function SubCategoryList({
  subs,
  editingSubId,
  editingSubName,
  editingSubIcon,
  showSubIconPicker,
  newSub,
  newSubIcon,
  showNewSubIconPicker,
  onEditingNameChange,
  onEditingIconSelect,
  onToggleSubIconPicker,
  onCloseSubIconPicker,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onNewSubChange,
  onNewSubIconSelect,
  onToggleNewSubIconPicker,
  onCloseNewSubIconPicker,
  onAddSub,
}: SubCategoryListProps) {
  return (
    <div className="mb-[26px]">
      <div className="text-[10px] font-semibold text-text-muted tracking-[0.08em] mb-2.5 uppercase">
        SUB-CATEGORIES
      </div>

      <div className="flex flex-col gap-1.5 mb-3">
        {subs.map((s) =>
          editingSubId === s.id ? (
            <SubCategoryRow
              key={s.id}
              mode="edit"
              sub={s}
              editName={editingSubName}
              editIcon={editingSubIcon}
              showIconPicker={showSubIconPicker}
              onNameChange={onEditingNameChange}
              onIconSelect={onEditingIconSelect}
              onToggleIconPicker={onToggleSubIconPicker}
              onCloseIconPicker={onCloseSubIconPicker}
              onSave={() => onSaveEdit(s)}
              onCancel={onCancelEdit}
            />
          ) : (
            <SubCategoryRow
              key={s.id}
              mode="view"
              sub={s}
              onEdit={() => onStartEdit(s)}
              onDelete={() => onDelete(s)}
            />
          ),
        )}
        {subs.length === 0 && (
          <span className="text-xs text-text-muted italic">
            No sub-categories yet
          </span>
        )}
      </div>

      {/* Add sub-category row */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
        <div className="relative shrink-0">
          <button
            onClick={onToggleNewSubIconPicker}
            className="w-[38px] h-[38px] rounded-lg border-2 border-dashed border-border-input bg-bg-white cursor-pointer text-base flex items-center justify-center hover:bg-bg-primary transition-colors"
          >
            {newSubIcon ?? <span className="text-sm text-text-muted">＋</span>}
          </button>
          {showNewSubIconPicker && (
            <div className="absolute bottom-11 left-0 z-50">
              <EmojiPicker
                onSelect={onNewSubIconSelect}
                onClose={onCloseNewSubIconPicker}
              />
            </div>
          )}
        </div>
        <input
          value={newSub}
          onChange={(e) => onNewSubChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddSub()}
          placeholder="Add sub-category…"
          className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg border-2 border-dashed border-bg-lime text-[13px] text-text-primary outline-none bg-[#FAFDE8] w-full"
        />
        <button
          onClick={onAddSub}
          className="w-full sm:w-auto px-[18px] py-2.5 rounded-lg border-none bg-bg-lime text-text-primary text-[13px] font-bold cursor-pointer hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </div>
    </div>
  );
}
