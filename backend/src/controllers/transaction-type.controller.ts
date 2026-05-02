import { Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const types = await prisma.transactionType.findMany();
    res.json({ data: types });
  } catch (err) {
    next(err);
  }
}
