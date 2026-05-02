import { PrismaClient } from '@prisma/client';

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
      const category = await prisma.category.upsert({
        where: { name_typeId_userId: { name: cat.name, typeId: type.id, userId: null } },
        update: {},
        create: { name: cat.name, typeId: type.id, userId: null },
      });

      for (const subName of cat.subs) {
        await prisma.subCategory.upsert({
          where: { name_categoryId_userId: { name: subName, categoryId: category.id, userId: null } },
          update: {},
          create: { name: subName, categoryId: category.id, userId: null },
        });
      }
    }
  }

  console.log('Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
