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
