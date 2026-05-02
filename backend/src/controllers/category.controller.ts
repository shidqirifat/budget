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
      include: { type: true },
      orderBy: { name: 'asc' },
    });
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, typeId } = req.body;
    const category = await prisma.category.create({
      data: { name, typeId, userId: req.userId },
    });
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
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
      data: { name: req.body.name, categoryId: req.params.id, userId: req.userId },
    });
    res.status(201).json({ data: subCategory });
  } catch (err) {
    next(err);
  }
}
