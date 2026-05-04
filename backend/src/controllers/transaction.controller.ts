import { Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { typeId, categoryId, subCategoryId, eventId, from, to } = req.query;
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        ...(typeId ? { typeId: String(typeId) } : {}),
        ...(categoryId ? { categoryId: String(categoryId) } : {}),
        ...(subCategoryId ? { subCategoryId: String(subCategoryId) } : {}),
        ...(eventId ? { eventId: String(eventId) } : {}),
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(String(from)) } : {}),
                ...(to ? { lte: new Date(String(to)) } : {}),
              },
            }
          : {}),
      },
      include: { type: true, category: true, subCategory: true, event: true },
      orderBy: { date: 'desc' },
    });
    res.json({ data: transactions });
  } catch (err) {
    next(err);
  }
}

export async function getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to } = req.query;
    const dateFilter = from || to
      ? {
          date: {
            ...(from ? { gte: new Date(String(from)) } : {}),
            ...(to ? { lte: new Date(String(to)) } : {}),
          },
        }
      : {};

    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId: req.userId, type: { name: 'income' }, ...dateFilter },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: req.userId, type: { name: 'expense' }, ...dateFilter },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = income._sum.amount ?? 0;
    const totalExpense = expense._sum.amount ?? 0;

    res.json({
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const transaction = await prisma.transaction.create({
      data: { ...req.body, userId: req.userId! },
      include: { type: true, category: true, subCategory: true, event: true },
    });
    res.status(201).json({ data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: req.body,
      include: { type: true, category: true, subCategory: true, event: true },
    });
    res.json({ data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { month } = req.query; // e.g. "2026-04"
    const targetMonth = month ? String(month) : new Date().toISOString().slice(0, 7);

    // Build 6 consecutive month keys ending at targetMonth
    const [year, mon] = targetMonth.split('-').map(Number);
    const monthKeys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, mon - 1 - i, 1);
      monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    // Fetch monthly inflow/outflow for each month
    const monthlyData = await Promise.all(
      monthKeys.map(async (mk) => {
        const from = new Date(`${mk}-01T00:00:00.000Z`);
        const to = new Date(from.getFullYear(), from.getMonth() + 1, 0, 23, 59, 59, 999);
        const [income, expense] = await Promise.all([
          prisma.transaction.aggregate({
            where: { userId: req.userId, type: { name: 'income' }, date: { gte: from, lte: to } },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: { userId: req.userId, type: { name: 'expense' }, date: { gte: from, lte: to } },
            _sum: { amount: true },
          }),
        ]);
        return { month: mk, inflow: income._sum.amount ?? 0, outflow: expense._sum.amount ?? 0 };
      })
    );

    // Category breakdown for the selected month
    const selFrom = new Date(`${targetMonth}-01T00:00:00.000Z`);
    const selTo = new Date(selFrom.getFullYear(), selFrom.getMonth() + 1, 0, 23, 59, 59, 999);

    const txs = await prisma.transaction.findMany({
      where: { userId: req.userId, type: { name: 'expense' }, date: { gte: selFrom, lte: selTo } },
      include: { category: true, subCategory: true },
    });

    // Group by category
    const catMap: Record<string, { categoryId: string; name: string; amount: number; subs: Record<string, { name: string; amount: number }> }> = {};
    for (const tx of txs) {
      const key = tx.categoryId;
      if (!catMap[key]) catMap[key] = { categoryId: key, name: tx.category.name, amount: 0, subs: {} };
      catMap[key].amount += tx.amount;
      if (tx.subCategory) {
        const sk = tx.subCategoryId!;
        if (!catMap[key].subs[sk]) catMap[key].subs[sk] = { name: tx.subCategory.name, amount: 0 };
        catMap[key].subs[sk].amount += tx.amount;
      }
    }

    // Most frequent expense category (by transaction count)
    const freqMap: Record<string, { name: string; count: number }> = {};
    for (const tx of txs) {
      if (!freqMap[tx.categoryId]) freqMap[tx.categoryId] = { name: tx.category.name, count: 0 };
      freqMap[tx.categoryId].count++;
    }
    const mostFrequentExpense = Object.values(freqMap).sort((a, b) => b.count - a.count)[0] ?? null;

    // Most total income category for selected month + full income breakdown
    const incomeTxs = await prisma.transaction.findMany({
      where: { userId: req.userId, type: { name: 'income' }, date: { gte: selFrom, lte: selTo } },
      include: { category: true, subCategory: true },
    });
    const incCatMap: Record<string, { categoryId: string; name: string; amount: number; subs: Record<string, { name: string; amount: number }> }> = {};
    for (const tx of incomeTxs) {
      const key = tx.categoryId;
      if (!incCatMap[key]) incCatMap[key] = { categoryId: key, name: tx.category.name, amount: 0, subs: {} };
      incCatMap[key].amount += tx.amount;
      if (tx.subCategory) {
        const sk = tx.subCategoryId!;
        if (!incCatMap[key].subs[sk]) incCatMap[key].subs[sk] = { name: tx.subCategory.name, amount: 0 };
        incCatMap[key].subs[sk].amount += tx.amount;
      }
    }

    // Previous month data (needed for prevAmount on each row)
    const prevMonthKey = monthKeys[monthKeys.length - 2];
    const prevFrom = new Date(`${prevMonthKey}-01T00:00:00.000Z`);
    const prevTo = new Date(prevFrom.getFullYear(), prevFrom.getMonth() + 1, 0, 23, 59, 59, 999);

    const [prevExpTxs, prevIncTxs] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.userId, type: { name: 'expense' }, date: { gte: prevFrom, lte: prevTo } },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId: req.userId, type: { name: 'income' }, date: { gte: prevFrom, lte: prevTo } },
        include: { category: true },
      }),
    ]);

    const prevExpMap: Record<string, { name: string; amount: number }> = {};
    for (const tx of prevExpTxs) {
      if (!prevExpMap[tx.categoryId]) prevExpMap[tx.categoryId] = { name: tx.category.name, amount: 0 };
      prevExpMap[tx.categoryId].amount += tx.amount;
    }
    const prevIncMap: Record<string, { name: string; amount: number }> = {};
    for (const tx of prevIncTxs) {
      if (!prevIncMap[tx.categoryId]) prevIncMap[tx.categoryId] = { name: tx.category.name, amount: 0 };
      prevIncMap[tx.categoryId].amount += tx.amount;
    }

    // Build final breakdowns with prevAmount per row
    const categoryBreakdown = Object.values(catMap)
      .sort((a, b) => b.amount - a.amount)
      .map(c => ({
        ...c,
        prevAmount: prevExpMap[c.categoryId]?.amount ?? 0,
        subs: Object.values(c.subs).sort((a, b) => b.amount - a.amount),
      }));

    const incomeBreakdown = Object.values(incCatMap)
      .sort((a, b) => b.amount - a.amount)
      .map(c => ({
        ...c,
        prevAmount: prevIncMap[c.categoryId]?.amount ?? 0,
        subs: Object.values(c.subs).sort((a, b) => b.amount - a.amount),
      }));

    // Compute per-category diffs for insights panel (only categories with a diff)
    const allExpCatIds = new Set([...Object.keys(catMap), ...Object.keys(prevExpMap)]);
    const expenseDiff = Array.from(allExpCatIds)
      .map(id => ({
        categoryId: id,
        name: catMap[id]?.name ?? prevExpMap[id]?.name ?? '',
        current: catMap[id]?.amount ?? 0,
        prev: prevExpMap[id]?.amount ?? 0,
        diff: (catMap[id]?.amount ?? 0) - (prevExpMap[id]?.amount ?? 0),
      }))
      .filter(r => r.diff !== 0)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    const allIncCatIds = new Set([...Object.keys(incCatMap), ...Object.keys(prevIncMap)]);
    const incomeDiff = Array.from(allIncCatIds)
      .map(id => ({
        categoryId: id,
        name: incCatMap[id]?.name ?? prevIncMap[id]?.name ?? '',
        current: incCatMap[id]?.amount ?? 0,
        prev: prevIncMap[id]?.amount ?? 0,
        diff: (incCatMap[id]?.amount ?? 0) - (prevIncMap[id]?.amount ?? 0),
      }))
      .filter(r => r.diff !== 0)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    const mostIncomeCategory = incomeBreakdown[0] ? { name: incomeBreakdown[0].name, amount: incomeBreakdown[0].amount } : null;

    const insights = {
      mostExpenseCategory: categoryBreakdown[0] ? { name: categoryBreakdown[0].name, amount: categoryBreakdown[0].amount } : null,
      mostFrequentExpense: mostFrequentExpense ? { name: mostFrequentExpense.name, count: mostFrequentExpense.count } : null,
      mostIncomeCategory,
      expenseDiff,
      incomeDiff,
    };

    res.json({ data: { monthly: monthlyData, categoryBreakdown, incomeBreakdown, insights } });
  } catch (err) {
    next(err);
  }
}

export async function patchEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const { eventId } = req.body as { eventId: string | null };
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: { eventId: eventId ?? null },
      include: { type: true, category: true, subCategory: true, event: true },
    });
    res.json({ data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
