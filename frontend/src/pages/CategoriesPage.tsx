import { useCategoryList } from "@/hooks/useCategoryList";
import { useCategoryDetail } from "@/hooks/useCategoryDetail";
import CategoryList from "@/components/categories/CategoryList";
import CategoryDetail from "@/components/categories/CategoryDetail";

export default function CategoriesPage() {
  const list = useCategoryList();
  const selected = list.cats.find((c) => c.id === list.selectedId) ?? null;

  const detail = useCategoryDetail(list.selectedId, selected);

  const detailError = detail.error;
  const listError = list.error;
  const anyError = listError ?? detailError;

  const clearError = () => {
    list.setError(null);
    detail.setError(null);
  };

  if (list.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <span className="text-text-muted text-sm">Loading categories…</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Error banner */}
      {anyError && (
        <div className="px-8 py-2 bg-surface-error border-b border-border-default flex justify-between items-center shrink-0">
          <span className="text-[13px] text-text-expense">{anyError}</span>
          <button
            onClick={clearError}
            className="text-[13px] text-text-expense cursor-pointer bg-transparent border-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="px-4 sm:px-8 pt-7 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          {list.mobileView === "detail" && (
            <button
              className="flex sm:hidden items-center gap-1 px-3 py-1.5 rounded-lg border border-border-input bg-bg-white text-text-primary text-[13px] cursor-pointer"
              onClick={() => list.setMobileView("list")}
            >
              ← Back
            </button>
          )}
          <h1 className="text-[22px] font-bold text-text-primary tracking-tight m-0">
            Categories
          </h1>
        </div>
        {list.mobileView === "list" && (
          <button
            onClick={list.handleAddCategory}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border-none bg-bg-lime text-text-primary text-[13px] font-bold cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">New Category</span>
            <span className="sm:hidden">New</span>
          </button>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 px-4 sm:px-8 pb-8 gap-5 overflow-hidden">
        {/* Left list panel */}
        <div
          className={[
            "shrink-0 bg-bg-white rounded-xl border border-border-default overflow-hidden flex-col shadow-sm",
            list.mobileView === "detail"
              ? "hidden sm:flex"
              : "flex w-full sm:w-64",
          ].join(" ")}
        >
          <CategoryList
            categories={list.cats}
            activeTab={list.activeTab}
            selectedId={list.selectedId}
            onTabChange={list.setActiveTab}
            onSelect={list.handleSelectCategory}
          />
        </div>

        {/* Right detail panel */}
        <div
          className={[
            "flex-1 bg-bg-white rounded-xl border border-border-default flex-col overflow-hidden shadow-sm",
            list.mobileView === "list" ? "hidden sm:flex" : "flex",
          ].join(" ")}
        >
          {selected ? (
            <CategoryDetail
              selected={selected}
              subs={detail.subs}
              stats={detail.stats}
              types={list.types}
              editName={detail.editName}
              editTypeId={detail.editTypeId}
              editIcon={detail.editIcon}
              showIconPicker={detail.showIconPicker}
              saved={detail.saved}
              editingSubId={detail.editingSubId}
              editingSubName={detail.editingSubName}
              editingSubIcon={detail.editingSubIcon}
              showSubIconPicker={detail.showSubIconPicker}
              newSub={detail.newSub}
              newSubIcon={detail.newSubIcon}
              showNewSubIconPicker={detail.showNewSubIconPicker}
              onNameChange={detail.setEditName}
              onTypeChange={detail.setEditTypeId}
              onIconSelect={(emoji) => {
                detail.setEditIcon(emoji);
                detail.setShowIconPicker(false);
              }}
              onIconClear={() => detail.setEditIcon(null)}
              onToggleIconPicker={() => detail.setShowIconPicker((p) => !p)}
              onCloseIconPicker={() => detail.setShowIconPicker(false)}
              onSave={() => detail.handleSave(list.updateCatInList)}
              onDelete={() => list.handleDeleteCategory(selected.id)}
              onEditingNameChange={detail.setEditingSubName}
              onEditingIconSelect={(emoji) => {
                detail.setEditingSubIcon(emoji);
                detail.setShowSubIconPicker(false);
              }}
              onToggleSubIconPicker={() =>
                detail.setShowSubIconPicker((p) => !p)
              }
              onCloseSubIconPicker={() => detail.setShowSubIconPicker(false)}
              onStartEditSub={detail.handleStartEditSub}
              onSaveEditSub={detail.handleSaveSub}
              onCancelEditSub={detail.handleCancelEditSub}
              onDeleteSub={detail.handleRemoveSub}
              onNewSubChange={detail.setNewSub}
              onNewSubIconSelect={(emoji) => {
                detail.setNewSubIcon(emoji);
                detail.setShowNewSubIconPicker(false);
              }}
              onToggleNewSubIconPicker={() =>
                detail.setShowNewSubIconPicker((p) => !p)
              }
              onCloseNewSubIconPicker={() =>
                detail.setShowNewSubIconPicker(false)
              }
              onAddSub={detail.handleAddSub}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
              Select a category to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
