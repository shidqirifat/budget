import { useState, useEffect, useCallback } from "react";
import { categoryService, Category } from "@/services/category.service";
import {
  transactionTypeService,
  TransactionType,
} from "@/services/transaction-type.service";

export function useCategoryList() {
  const [cats, setCats] = useState<Category[]>([]);
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll();
      const list: Category[] = res.data.data;
      setCats(list);
      if (!selectedId && list.length && window.innerWidth >= 640) {
        setSelectedId(list[0].id);
      }
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    transactionTypeService
      .getAll()
      .then((res) => setTypes(res.data.data))
      .catch(() => {});
    loadCategories();
  }, []);

  const handleSelectCategory = (id: string) => {
    setSelectedId(id);
    setMobileView("detail");
  };

  const handleAddCategory = async () => {
    if (!types.length) return;
    const tabType = types.find((t) => t.name === activeTab) ?? types[0];
    try {
      const res = await categoryService.create({
        name: "New Category",
        typeId: tabType.id,
        icon: null,
      });
      const newCat = res.data.data;
      setCats((prev) => [...prev, newCat]);
      setSelectedId(newCat.id);
      setMobileView("detail");
    } catch {
      setError("Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.remove(id);
      const remaining = cats.filter((c) => c.id !== id);
      setCats(remaining);
      setSelectedId(remaining.length ? remaining[0].id : null);
      setMobileView("list");
    } catch {
      setError("Failed to delete category");
    }
  };

  const updateCatInList = (updated: Category) => {
    setCats((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
    );
  };

  return {
    cats,
    types,
    activeTab,
    setActiveTab,
    selectedId,
    mobileView,
    setMobileView,
    loading,
    error,
    setError,
    handleSelectCategory,
    handleAddCategory,
    handleDeleteCategory,
    updateCatInList,
  };
}
