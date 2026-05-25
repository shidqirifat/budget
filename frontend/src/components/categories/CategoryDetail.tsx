import Avatar from "@/components/ui/Avatar";
import {
  Category,
  SubCategory,
  CategoryStats,
} from "@/services/category.service";
import { TransactionType } from "@/services/transaction-type.service";
import CategoryForm from "./CategoryForm";
import SubCategoryList from "./SubCategoryList";
import CategoryUsageChart from "./CategoryUsageChart";

interface CategoryDetailProps {
  selected: Category;
  subs: SubCategory[];
  stats: CategoryStats | null;
  types: TransactionType[];

  editName: string;
  editTypeId: string;
  editIcon: string | null;
  showIconPicker: boolean;
  saved: boolean;

  editingSubId: string | null;
  editingSubName: string;
  editingSubIcon: string | null;
  showSubIconPicker: boolean;

  newSub: string;
  newSubIcon: string | null;
  showNewSubIconPicker: boolean;

  onNameChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onIconSelect: (emoji: string) => void;
  onIconClear: () => void;
  onToggleIconPicker: () => void;
  onCloseIconPicker: () => void;
  onSave: () => void;
  onDelete: () => void;

  onEditingNameChange: (v: string) => void;
  onEditingIconSelect: (emoji: string) => void;
  onToggleSubIconPicker: () => void;
  onCloseSubIconPicker: () => void;
  onStartEditSub: (sub: SubCategory) => void;
  onSaveEditSub: (sub: SubCategory) => void;
  onCancelEditSub: () => void;
  onDeleteSub: (sub: SubCategory) => void;

  onNewSubChange: (v: string) => void;
  onNewSubIconSelect: (emoji: string) => void;
  onToggleNewSubIconPicker: () => void;
  onCloseNewSubIconPicker: () => void;
  onAddSub: () => void;
}

export default function CategoryDetail({
  selected,
  subs,
  stats,
  types,
  editName,
  editTypeId,
  editIcon,
  showIconPicker,
  saved,
  editingSubId,
  editingSubName,
  editingSubIcon,
  showSubIconPicker,
  newSub,
  newSubIcon,
  showNewSubIconPicker,
  onNameChange,
  onTypeChange,
  onIconSelect,
  onIconClear,
  onToggleIconPicker,
  onCloseIconPicker,
  onSave,
  onDelete,
  onEditingNameChange,
  onEditingIconSelect,
  onToggleSubIconPicker,
  onCloseSubIconPicker,
  onStartEditSub,
  onSaveEditSub,
  onCancelEditSub,
  onDeleteSub,
  onNewSubChange,
  onNewSubIconSelect,
  onToggleNewSubIconPicker,
  onCloseNewSubIconPicker,
  onAddSub,
}: CategoryDetailProps) {
  return (
    <>
      {/* Detail header — desktop only */}
      <div className="hidden sm:flex px-7 py-[22px] border-b border-border-default items-center gap-4 shrink-0">
        <Avatar icon={selected.icon} name={selected.name} size="lg" />
        <div>
          <div className="text-xl font-bold text-text-primary tracking-tight">
            {selected.name}
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            {subs.length} sub-categories · {selected.type.name}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <CategoryForm
          editName={editName}
          editTypeId={editTypeId}
          editIcon={editIcon}
          showIconPicker={showIconPicker}
          types={types}
          onNameChange={onNameChange}
          onTypeChange={onTypeChange}
          onIconSelect={onIconSelect}
          onIconClear={onIconClear}
          onToggleIconPicker={onToggleIconPicker}
          onCloseIconPicker={onCloseIconPicker}
        />

        <SubCategoryList
          subs={subs}
          editingSubId={editingSubId}
          editingSubName={editingSubName}
          editingSubIcon={editingSubIcon}
          showSubIconPicker={showSubIconPicker}
          newSub={newSub}
          newSubIcon={newSubIcon}
          showNewSubIconPicker={showNewSubIconPicker}
          onEditingNameChange={onEditingNameChange}
          onEditingIconSelect={onEditingIconSelect}
          onToggleSubIconPicker={onToggleSubIconPicker}
          onCloseSubIconPicker={onCloseSubIconPicker}
          onStartEdit={onStartEditSub}
          onSaveEdit={onSaveEditSub}
          onCancelEdit={onCancelEditSub}
          onDelete={onDeleteSub}
          onNewSubChange={onNewSubChange}
          onNewSubIconSelect={onNewSubIconSelect}
          onToggleNewSubIconPicker={onToggleNewSubIconPicker}
          onCloseNewSubIconPicker={onCloseNewSubIconPicker}
          onAddSub={onAddSub}
        />

        <CategoryUsageChart
          stats={stats}
          typeName={selected.type.name as "income" | "expense"}
        />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onSave}
            className={`flex-1 py-3 rounded-lg border-none text-sm font-bold cursor-pointer transition-colors ${saved ? "bg-[#e8ff80]" : "bg-bg-lime"} text-text-primary`}
          >
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
          <button
            onClick={onDelete}
            className="px-5 py-3 rounded-lg border border-surface-error bg-surface-error text-text-expense text-[13px] cursor-pointer hover:opacity-80 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
