import { Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.userId },
      orderBy: { startDate: 'desc' },
    });
    res.json({ data: events });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await prisma.event.create({
      data: { ...req.body, userId: req.userId! },
    });
    res.status(201).json({ data: event });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const event = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
    res.json({ data: event });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
