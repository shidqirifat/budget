import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_DATA = {
  income: [
    { name: 'Salary', subs: ['Base Salary', 'Bonus'] },
    { name: 'Freelance', subs: ['Project', 'Consultation'] },
    { name: 'Investment', subs: ['Dividends', 'Capital Gain'] },
    { name: 'Gift', subs: [] },
    { name: 'Other', subs: [] },
  ],
  expense: [
    { name: 'Food & Drink', subs: ['Restaurant', 'Groceries', 'Coffee'] },
    { name: 'Transport', subs: ['Fuel', 'Public Transit', 'Parking'] },
    { name: 'Shopping', subs: ['Clothing', 'Electronics', 'Household'] },
    { name: 'Bills', subs: ['Electricity', 'Water', 'Internet', 'Rent'] },
    { name: 'Health', subs: ['Medicine', 'Doctor', 'Gym'] },
    { name: 'Entertainment', subs: ['Movies', 'Streaming', 'Games'] },
    { name: 'Education', subs: ['Books', 'Courses', 'Stationery'] },
    { name: 'Other', subs: [] },
  ],
};

async function main() {
  for (const typeName of ['income', 'expense'] as const) {
    const type = await prisma.transactionType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });

    for (const cat of SEED_DATA[typeName]) {
      const existing = await prisma.category.findFirst({
        where: { name: cat.name, typeId: type.id, userId: null },
      });
      const category = existing ?? await prisma.category.create({
        data: { name: cat.name, typeId: type.id, userId: null },
      });

      for (const subName of cat.subs) {
        const existingSub = await prisma.subCategory.findFirst({
          where: { name: subName, categoryId: category.id, userId: null },
        });
        if (!existingSub) {
          await prisma.subCategory.create({
            data: { name: subName, categoryId: category.id, userId: null },
          });
        }
      }
    }
  }

  // Seed user
  const hashedPassword = await bcrypt.hash('Password123*', 10);
  const user = await prisma.user.upsert({
    where: { email: 'shidqi@example.com' },
    update: {},
    create: { email: 'shidqi@example.com', name: 'Shidqi', password: hashedPassword },
  });

  // Seed sample transactions for the user
  const incomeType = await prisma.transactionType.findUnique({ where: { name: 'income' } });
  const expenseType = await prisma.transactionType.findUnique({ where: { name: 'expense' } });
  const salaryCategory = await prisma.category.findFirst({ where: { name: 'Salary', userId: null } });
  const salarySubCat = await prisma.subCategory.findFirst({ where: { name: 'Base Salary', userId: null } });
  const foodCategory = await prisma.category.findFirst({ where: { name: 'Food & Drink', userId: null } });
  const foodSubCat = await prisma.subCategory.findFirst({ where: { name: 'Restaurant', userId: null } });

  if (incomeType && salaryCategory && salarySubCat) {
    await prisma.transaction.createMany({
      data: [
        {
          amount: 10000000,
          typeId: incomeType.id,
          categoryId: salaryCategory.id,
          subCategoryId: salarySubCat.id,
          date: new Date('2025-04-01'),
          note: 'April salary',
          userId: user.id,
        },
      ],
      skipDuplicates: true,
    });
  }

  if (expenseType && foodCategory && foodSubCat) {
    await prisma.transaction.createMany({
      data: [
        {
          amount: 85000,
          typeId: expenseType.id,
          categoryId: foodCategory.id,
          subCategoryId: foodSubCat.id,
          date: new Date('2025-04-05'),
          note: 'Lunch with team',
          userId: user.id,
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log('Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
