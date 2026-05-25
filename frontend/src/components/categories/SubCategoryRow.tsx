import Avatar from "@/components/ui/Avatar";
import EmojiPicker from "@/components/ui/EmojiPicker";
import { SubCategory } from "@/services/category.service";

interface SubCategoryRowViewProps {
  sub: SubCategory;
  onEdit: () => void;
  onDelete: () => void;
}

interface SubCategoryRowEditProps {
  sub: SubCategory;
  editName: string;
  editIcon: string | null;
  showIconPicker: boolean;
  onNameChange: (v: string) => void;
  onIconSelect: (emoji: string) => void;
  onToggleIconPicker: () => void;
  onCloseIconPicker: () => void;
  onSave: () => void;
  onCancel: () => void;
}

type SubCategoryRowProps =
  | ({ mode: "view" } & SubCategoryRowViewProps)
  | ({ mode: "edit" } & SubCategoryRowEditProps);

export default function SubCategoryRow(props: SubCategoryRowProps) {
  if (props.mode === "edit") {
    const {
      sub,
      editName,
      editIcon,
      showIconPicker,
      onNameChange,
      onIconSelect,
      onToggleIconPicker,
      onCloseIconPicker,
      onSave,
      onCancel,
    } = props;

    return (
      <div className="flex flex-col gap-2 px-3 py-[7px] rounded-lg bg-bg-primary border border-border-default">
        {/* Icon + input row */}
        <div className="flex gap-2 items-center">
          <div className="relative shrink-0">
            <button
              onClick={onToggleIconPicker}
              className="w-8 h-8 rounded-md border border-border-input bg-bg-white cursor-pointer text-base flex items-center justify-center hover:bg-bg-primary transition-colors"
            >
              {editIcon ?? <span className="text-sm text-text-muted">＋</span>}
            </button>
            {showIconPicker && (
              <div className="absolute top-9 left-0 z-50">
                <EmojiPicker
                  onSelect={onIconSelect}
                  onClose={onCloseIconPicker}
                />
              </div>
            )}
          </div>
          <input
            autoFocus
            value={editName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancel();
            }}
            className="flex-1 min-w-0 px-2 py-1 rounded-md border border-bg-lime text-[13px] text-text-primary outline-none bg-bg-white"
          />
        </div>
        {/* Save / Cancel */}
        <div className="flex gap-1.5">
          <button
            onClick={onSave}
            className="flex-1 py-1.5 px-3 rounded-md border-none bg-bg-lime text-text-primary text-xs font-bold cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-1.5 px-2.5 rounded-md border border-border-input bg-bg-white text-text-secondary text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const { sub, onEdit, onDelete } = props;
  return (
    <div className="flex items-center gap-2 px-3 py-[7px] rounded-lg bg-bg-primary border border-border-default">
      <Avatar icon={sub.icon} name={sub.name} size="sm" />
      <span className="flex-1 text-[13px] text-text-primary">{sub.name}</span>
      <button
        onClick={onEdit}
        title="Edit"
        className="w-[30px] h-[30px] rounded-md border border-border-input bg-bg-white text-text-secondary text-sm cursor-pointer flex items-center justify-center shrink-0 hover:bg-bg-primary transition-colors"
      >
        ✏️
      </button>
      <button
        onClick={onDelete}
        title="Delete"
        className="w-[30px] h-[30px] rounded-md border border-surface-error bg-surface-error text-text-expense text-sm cursor-pointer flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
      >
        🗑️
      </button>
    </div>
  );
}
