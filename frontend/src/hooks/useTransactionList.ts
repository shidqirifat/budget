import { useState, useEffect, useMemo } from "react";
import dayjs from "@/utils/dayjs";
import { transactionService, Transaction } from "@/services/transaction.service";
import { categoryService, Category } from "@/services/category.service";
import { useTransactionFilter } from "./useTransactionFilter";

export interface TransactionGroup {
  date: string;
  day: number;
  dayName: string;
  monthName: string;
  year: number;
  dayTotal: number;
  transactions: Transaction[];
}

function currentMonthKey(): string {
  return dayjs().format("YYYY-MM");
}

function getMonthRange(month: string): { from: string; to: string } {
  const d = dayjs(month + "-01");
  return {
    from: d.startOf("month").format("YYYY-MM-DD"),
    to: d.endOf("month").format("YYYY-MM-DD"),
  };
}

function txSignedAmount(tx: Transaction): number {
  return tx.type.name === "income" ? tx.amount : -tx.amount;
}

export function useTransactionList() {
  const [month, setMonth] = useState(currentMonthKey);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.getAll().then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const { from, to } = getMonthRange(month);
    transactionService
      .getAll({ from, to })
      .then((r) => setTransactions(r.data.data))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [month]);

  const { filter, actions, filtered, options } = useTransactionFilter(transactions, categories);

  const inflow = useMemo(
    () => filtered.reduce((s, t) => (t.type.name === "income" ? s + t.amount : s), 0),
    [filtered],
  );
  const outflow = useMemo(
    () => filtered.reduce((s, t) => (t.type.name === "expense" ? s + t.amount : s), 0),
    [filtered],
  );

  const groups = useMemo<TransactionGroup[]>(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
      const date = tx.date.slice(0, 10);
      if (!map[date]) map[date] = [];
      map[date].push(tx);
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, txs]) => {
        const d = dayjs(date);
        return {
          date,
          day: d.date(),
          dayName: d.format("dddd"),
          monthName: d.format("MMMM"),
          year: d.year(),
          dayTotal: txs.reduce((s, t) => s + txSignedAmount(t), 0),
          transactions: txs,
        };
      });
  }, [filtered]);

  const monthLabel = dayjs(month + "-01").format("MMMM YYYY");

  return {
    month,
    setMonth,
    monthLabel,
    loading,
    groups,
    inflow,
    outflow,
    net: inflow - outflow,
    filteredCount: filtered.length,
    categories,
    filter,
    filterActions: actions,
    filterOptions: options,
  };
}
