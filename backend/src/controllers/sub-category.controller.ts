import { Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AuthRequest } from '../middleware/auth.middleware';

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.subCategory.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const subCategory = await prisma.subCategory.update({
      where: { id: req.params.id },
      data: { name: req.body.name },
    });
    res.json({ data: subCategory });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.subCategory.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await prisma.subCategory.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
