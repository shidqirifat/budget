import { useState, useEffect } from "react";
import dayjs from "@/utils/dayjs";
import {
  transactionService,
  AnalyticsData,
  AnalyticsMonthly,
  AnalyticsCategory,
} from "@/services/transaction.service";
import { CATEGORY_COLORS } from "@/utils/analytics";

export type CatWithColor = AnalyticsCategory & { color: string };

export interface UseAnalyticsReturn {
  month: string;
  setMonth: (m: string) => void;
  activeTab: "overview" | "categories";
  setActiveTab: (t: "overview" | "categories") => void;
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  cur: AnalyticsMonthly | undefined;
  prev: AnalyticsMonthly | undefined;
  inflow: number;
  outflow: number;
  net: number;
  savingsRate: number;
  diffInflow: number;
  diffOutflow: number;
  pctInflow: number;
  pctOutflow: number;
  cats: CatWithColor[];
  totalOut: number;
  incCats: CatWithColor[];
  totalIn: number;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [activeTab, setActiveTab] = useState<"overview" | "categories">("overview");
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    transactionService
      .getAnalytics(month)
      .then((res) => setData(res.data.data))
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [month]);

  const cur = data?.monthly.find((m) => m.month === month);
  const curIdx = data?.monthly.findIndex((m) => m.month === month) ?? -1;
  const prev: AnalyticsMonthly | undefined =
    curIdx > 0 ? data?.monthly[curIdx - 1] : undefined;

  const inflow = cur?.inflow ?? 0;
  const outflow = cur?.outflow ?? 0;
  const net = inflow - outflow;
  const savingsRate = inflow > 0 ? Math.round((net / inflow) * 100) : 0;

  const diffInflow = prev ? inflow - prev.inflow : 0;
  const diffOutflow = prev ? outflow - prev.outflow : 0;
  const pctInflow =
    prev && prev.inflow > 0
      ? Math.round((Math.abs(diffInflow) / prev.inflow) * 100)
      : 0;
  const pctOutflow =
    prev && prev.outflow > 0
      ? Math.round((Math.abs(diffOutflow) / prev.outflow) * 100)
      : 0;

  const cats: CatWithColor[] = (data?.categoryBreakdown ?? []).map((c, i) => ({
    ...c,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
  const totalOut = cats.reduce((s, c) => s + c.amount, 0);

  const incCats: CatWithColor[] = (data?.incomeBreakdown ?? []).map((c, i) => ({
    ...c,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
  const totalIn = incCats.reduce((s, c) => s + c.amount, 0);

  return {
    month,
    setMonth,
    activeTab,
    setActiveTab,
    data,
    loading,
    error,
    cur,
    prev,
    inflow,
    outflow,
    net,
    savingsRate,
    diffInflow,
    diffOutflow,
    pctInflow,
    pctOutflow,
    cats,
    totalOut,
    incCats,
    totalIn,
  };
}
