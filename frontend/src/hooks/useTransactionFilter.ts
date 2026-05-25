import { useState, useMemo } from "react";
import { Transaction } from "@/services/transaction.service";
import { Category } from "@/services/category.service";

export interface TransactionFilter {
  search: string;
  categoryId: string;
  subCategoryId: string;
}

export interface TransactionFilterActions {
  setSearch: (v: string) => void;
  setCategoryId: (v: string) => void;
  setSubCategoryId: (v: string) => void;
  clearFilters: () => void;
}

export interface FilterOptions {
  catOptions: Category[];
  subOptions: { id: string; name: string }[];
  activeFilterCount: number;
  hasFilter: boolean;
}

export function useTransactionFilter(transactions: Transaction[], categories: Category[]) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryIdRaw] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");

  function setCategoryId(id: string) {
    setCategoryIdRaw(id);
    setSubCategoryId("");
  }

  function clearFilters() {
    setCategoryIdRaw("");
    setSubCategoryId("");
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter((tx) => {
      const matchSearch =
        !q ||
        tx.category.name.toLowerCase().includes(q) ||
        (tx.subCategory?.name ?? "").toLowerCase().includes(q) ||
        (tx.note ?? "").toLowerCase().includes(q);
      const matchCat = !categoryId || tx.categoryId === categoryId;
      const matchSub = !subCategoryId || tx.subCategoryId === subCategoryId;
      return matchSearch && matchCat && matchSub;
    });
  }, [transactions, search, categoryId, subCategoryId]);

  const catOptions = useMemo(() => {
    const ids = new Set(transactions.map((t) => t.categoryId));
    return categories.filter((c) => ids.has(c.id));
  }, [transactions, categories]);

  const subOptions = useMemo(() => {
    if (!categoryId) return [];
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    transactions.forEach((t) => {
      if (t.categoryId === categoryId && t.subCategory && !seen.has(t.subCategoryId!)) {
        seen.add(t.subCategoryId!);
        result.push({ id: t.subCategoryId!, name: t.subCategory.name });
      }
    });
    return result;
  }, [transactions, categoryId]);

  const activeFilterCount = (categoryId ? 1 : 0) + (subCategoryId ? 1 : 0);

  return {
    filter: { search, categoryId, subCategoryId } satisfies TransactionFilter,
    actions: { setSearch, setCategoryId, setSubCategoryId, clearFilters } satisfies TransactionFilterActions,
    filtered,
    options: {
      catOptions,
      subOptions,
      activeFilterCount,
      hasFilter: activeFilterCount > 0,
    } satisfies FilterOptions,
  };
}
