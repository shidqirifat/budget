import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive(),
  typeId: z.string().min(1),
  categoryId: z.string().min(1),
  subCategoryId: z.string().optional(),
  eventId: z.string().optional(),
  date: z.string().datetime(),
  note: z.string().optional(),
});
