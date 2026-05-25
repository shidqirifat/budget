import { useState, useEffect } from "react";
import {
  categoryService,
  Category,
  SubCategory,
  CategoryStats,
} from "@/services/category.service";

export function useCategoryDetail(
  selectedId: string | null,
  selected: Category | null,
) {
  const [subs, setSubs] = useState<SubCategory[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);

  // Category edit fields
  const [editName, setEditName] = useState("");
  const [editTypeId, setEditTypeId] = useState("");
  const [editIcon, setEditIcon] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  // New sub-category state
  const [newSub, setNewSub] = useState("");
  const [newSubIcon, setNewSubIcon] = useState<string | null>(null);
  const [showNewSubIconPicker, setShowNewSubIconPicker] = useState(false);

  // Editing existing sub-category state
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState("");
  const [editingSubIcon, setEditingSubIcon] = useState<string | null>(null);
  const [showSubIconPicker, setShowSubIconPicker] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    setSubs([]);
    setStats(null);
    setEditingSubId(null);
    setShowIconPicker(false);
    categoryService
      .getSubCategories(selectedId)
      .then((res) => setSubs(res.data.data))
      .catch(() => {});
    categoryService
      .getStats(selectedId)
      .then((res) => setStats(res.data.data))
      .catch(() => {});
  }, [selectedId]);

  useEffect(() => {
    if (selected) {
      setEditName(selected.name);
      setEditTypeId(selected.typeId);
      setEditIcon(selected.icon);
      setSaved(false);
    }
  }, [selectedId]);

  const handleSave = async (onSuccess: (updated: Category) => void) => {
    if (!selected) return;
    try {
      const res = await categoryService.update(selected.id, {
        name: editName,
        typeId: editTypeId,
        icon: editIcon,
      });
      onSuccess(res.data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save changes");
    }
  };

  const handleAddSub = async () => {
    const v = newSub.trim();
    if (!v || !selectedId) return;
    try {
      const res = await categoryService.createSubCategory(selectedId, {
        name: v,
        icon: newSubIcon,
      });
      setSubs((prev) => [...prev, res.data.data]);
      setNewSub("");
      setNewSubIcon(null);
    } catch {
      setError("Failed to add sub-category");
    }
  };

  const handleStartEditSub = (sub: SubCategory) => {
    setEditingSubId(sub.id);
    setEditingSubName(sub.name);
    setEditingSubIcon(sub.icon);
    setShowSubIconPicker(false);
  };

  const handleSaveSub = async (sub: SubCategory) => {
    const v = editingSubName.trim();
    if (!v) return;
    try {
      const res = await categoryService.updateSubCategory(sub.id, {
        name: v,
        icon: editingSubIcon,
      });
      setSubs((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? { ...s, name: res.data.data.name, icon: res.data.data.icon }
            : s,
        ),
      );
      setEditingSubId(null);
      setShowSubIconPicker(false);
    } catch {
      setError("Failed to update sub-category");
    }
  };

  const handleCancelEditSub = () => {
    setEditingSubId(null);
    setShowSubIconPicker(false);
  };

  const handleRemoveSub = async (sub: SubCategory) => {
    try {
      await categoryService.removeSubCategory(sub.id);
      setSubs((prev) => prev.filter((s) => s.id !== sub.id));
    } catch {
      setError("Cannot remove this sub-category");
    }
  };

  return {
    subs,
    stats,
    editName,
    setEditName,
    editTypeId,
    setEditTypeId,
    editIcon,
    setEditIcon,
    showIconPicker,
    setShowIconPicker,
    saved,
    newSub,
    setNewSub,
    newSubIcon,
    setNewSubIcon,
    showNewSubIconPicker,
    setShowNewSubIconPicker,
    editingSubId,
    editingSubName,
    setEditingSubName,
    editingSubIcon,
    setEditingSubIcon,
    showSubIconPicker,
    setShowSubIconPicker,
    error,
    setError,
    handleSave,
    handleAddSub,
    handleStartEditSub,
    handleSaveSub,
    handleCancelEditSub,
    handleRemoveSub,
  };
}
