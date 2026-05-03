import { Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { typeId } = req.query;
    const categories = await prisma.category.findMany({
      where: {
        ...(typeId ? { typeId: String(typeId) } : {}),
        OR: [{ userId: null }, { userId: req.userId }],
      },
      include: { type: true, _count: { select: { subCategories: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, typeId, icon } = req.body;
    const category = await prisma.category.create({
      data: { name, typeId, icon: icon ?? null, userId: req.userId },
      include: { type: true },
    });
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name: req.body.name, typeId: req.body.typeId, icon: req.body.icon ?? null },
      include: { type: true },
    });
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getSubCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const subCategories = await prisma.subCategory.findMany({
      where: {
        categoryId: req.params.id,
        OR: [{ userId: null }, { userId: req.userId }],
      },
      orderBy: { name: 'asc' },
    });
    res.json({ data: subCategories });
  } catch (err) {
    next(err);
  }
}

export async function createSubCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const subCategory = await prisma.subCategory.create({
      data: { name: req.body.name, icon: req.body.icon ?? null, categoryId: req.params.id, userId: req.userId },
    });
    res.status(201).json({ data: subCategory });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) { res.status(404).json({ error: 'Not found' }); return; }

    // Build last 3 months date ranges
    const now = new Date();
    const months: { label: string; from: Date; to: Date }[] = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const from = new Date(d.getFullYear(), d.getMonth(), 1);
      const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      months.push({
        label: from.toLocaleString('en-US', { month: 'short' }),
        from,
        to,
      });
    }

    const totals = await Promise.all(
      months.map(({ from, to }) =>
        prisma.transaction.aggregate({
          where: { userId: req.userId, categoryId: req.params.id, date: { gte: from, lte: to } },
          _sum: { amount: true },
        }).then(r => r._sum.amount ?? 0)
      )
    );

    const currentMonthTotal = await prisma.transaction.aggregate({
      where: {
        userId: req.userId,
        categoryId: req.params.id,
        date: { gte: months[2].from, lte: months[2].to },
      },
      _sum: { amount: true },
    });

    res.json({
      data: {
        months: months.map((m, i) => ({ label: m.label, total: totals[i] })),
        currentMonthTotal: currentMonthTotal._sum.amount ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
}
