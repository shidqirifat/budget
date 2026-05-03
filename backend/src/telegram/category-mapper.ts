import { prisma } from '../lib/db';

interface CategoryWithSubs {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

function score(ai: string, db: string): number {
  const a = ai.toLowerCase().trim();
  const b = db.toLowerCase().trim();
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  return 0;
}

async function fetchCategories(
  transactionTypeName: 'income' | 'expense',
  userId: string,
): Promise<CategoryWithSubs[]> {
  const txType = await prisma.transactionType.findUnique({ where: { name: transactionTypeName } });
  if (!txType) return [];

  return prisma.category.findMany({
    where: { typeId: txType.id, OR: [{ userId: null }, { userId }] },
    include: {
      subCategories: {
        where: { OR: [{ userId: null }, { userId }] },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export interface ResolvedCategory {
  categoryId: string;
  subCategoryId: string | null;
}

export async function resolveCategory(
  aiCategory: string | null,
  aiSubCategory: string | null,
  transactionTypeName: 'income' | 'expense',
  userId: string,
): Promise<ResolvedCategory | null> {
  const categories = await fetchCategories(transactionTypeName, userId);
  if (!categories.length) return null;

  const fallbackId = categories.find((c) => c.name.toLowerCase() === 'other')?.id ?? categories[0].id;

  // 1. Find best-matching category
  let bestCat: { cat: CategoryWithSubs; score: number } | null = null;
  for (const cat of categories) {
    const s = aiCategory ? score(aiCategory, cat.name) : 0;
    if (!bestCat || s > bestCat.score) bestCat = { cat, score: s };
  }

  if (!bestCat || bestCat.score === 0) {
    return { categoryId: fallbackId, subCategoryId: null };
  }

  const resolvedCat = bestCat.cat;

  // 2. Find best-matching sub-category within the resolved category
  if (!aiSubCategory || !resolvedCat.subCategories.length) {
    return { categoryId: resolvedCat.id, subCategoryId: null };
  }

  let bestSub: { id: string; score: number } | null = null;
  for (const sub of resolvedCat.subCategories) {
    const s = score(aiSubCategory, sub.name);
    if (!bestSub || s > bestSub.score) bestSub = { id: sub.id, score: s };
  }

  return {
    categoryId: resolvedCat.id,
    subCategoryId: bestSub && bestSub.score > 0 ? bestSub.id : null,
  };
}

export async function resolveTypeId(transactionTypeName: 'income' | 'expense'): Promise<string | null> {
  const txType = await prisma.transactionType.findUnique({ where: { name: transactionTypeName } });
  return txType?.id ?? null;
}

export async function getCategoryListText(
  transactionTypeName: 'income' | 'expense',
  userId: string,
): Promise<string> {
  const categories = await fetchCategories(transactionTypeName, userId);
  return categories
    .map((c) => {
      const subs = c.subCategories.map((s) => `  ↳ ${s.name}`).join('\n');
      return subs ? `• ${c.name}\n${subs}` : `• ${c.name}`;
    })
    .join('\n');
}

// Returns a prompt-ready string listing all categories + sub-categories for both types
export async function buildCategoryPromptContext(userId: string): Promise<string> {
  const [expCats, incCats] = await Promise.all([
    fetchCategories('expense', userId),
    fetchCategories('income', userId),
  ]);

  const format = (cats: CategoryWithSubs[]) =>
    cats
      .map((c) => {
        const subs = c.subCategories.map((s) => s.name).join(', ');
        return subs ? `  - ${c.name}: ${subs}` : `  - ${c.name}`;
      })
      .join('\n');

  return `Expense categories:\n${format(expCats)}\n\nIncome categories:\n${format(incCats)}`;
}
