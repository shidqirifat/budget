import { useState, useEffect, useCallback } from "react";
import { BudgetEvent } from "@/services/event.service";
import {
  transactionService,
  Transaction,
} from "@/services/transaction.service";

const TODAY = new Date().toISOString().slice(0, 10);

export function useEventDetail(selected: BudgetEvent | null) {
  const [linkedTxs, setLinkedTxs] = useState<Transaction[]>([]);
  const [recommendedTxs, setRecommendedTxs] = useState<Transaction[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);
  const [monthOutflow, setMonthOutflow] = useState(0);

  useEffect(() => {
    if (!selected) {
      setLinkedTxs([]);
      setRecommendedTxs([]);
      setMonthOutflow(0);
      return;
    }
    setLoadingTxs(true);
    const start = selected.startDate.slice(0, 10);
    const end = selected.endDate ? selected.endDate.slice(0, 10) : TODAY;
    const monthStart = start.slice(0, 7);
    const lastDay = new Date(
      new Date(start).getFullYear(),
      new Date(start).getMonth() + 1,
      0,
    ).getDate();

    Promise.all([
      transactionService.getAll({ eventId: selected.id }),
      transactionService.getAll({
        from: `${start}T00:00:00.000Z`,
        to: `${end}T23:59:59.999Z`,
      }),
      transactionService.getSummary({
        from: `${monthStart}-01T00:00:00.000Z`,
        to: `${monthStart}-${lastDay}T23:59:59.999Z`,
      }),
    ])
      .then(([linkedRes, rangeRes, summaryRes]) => {
        const linked = linkedRes.data.data;
        setLinkedTxs(linked);
        const linkedIds = new Set(linked.map((t) => t.id));
        setRecommendedTxs(
          rangeRes.data.data.filter((t) => !linkedIds.has(t.id)),
        );
        setMonthOutflow(summaryRes.data.data.totalExpense);
      })
      .finally(() => setLoadingTxs(false));
  }, [selected?.id]);

  const eventTotal = linkedTxs.reduce(
    (s, t) => s + (t.type.name === "income" ? t.amount : -t.amount),
    0,
  );

  const eventOutflow = linkedTxs
    .filter((t) => t.type.name === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const contributionPct =
    monthOutflow > 0 ? Math.round((eventOutflow / monthOutflow) * 100) : 0;

  const linkTx = useCallback(
    async (txId: string) => {
      if (!selected) return;
      await transactionService.patchEvent(txId, selected.id);
      setLinkedTxs((prev) => {
        const tx = recommendedTxs.find((t) => t.id === txId);
        return tx ? [...prev, tx] : prev;
      });
      setRecommendedTxs((prev) => prev.filter((t) => t.id !== txId));
    },
    [selected, recommendedTxs],
  );

  const unlinkTx = useCallback(
    async (txId: string) => {
      await transactionService.patchEvent(txId, null);
      setRecommendedTxs((prev) => {
        const tx = linkedTxs.find((t) => t.id === txId);
        return tx ? [...prev, tx] : prev;
      });
      setLinkedTxs((prev) => prev.filter((t) => t.id !== txId));
    },
    [linkedTxs],
  );

  return {
    linkedTxs,
    recommendedTxs,
    loadingTxs,
    monthOutflow,
    eventTotal,
    eventOutflow,
    contributionPct,
    linkTx,
    unlinkTx,
  };
}
