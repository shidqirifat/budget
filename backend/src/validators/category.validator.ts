import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1),
  typeId: z.string().min(1),
  icon: z.string().nullable().optional(),
});

export const subCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
});
