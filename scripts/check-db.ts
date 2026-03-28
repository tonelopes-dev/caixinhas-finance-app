
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clara = await prisma.user.findFirst({ where: { email: 'clara.beatriz@caixinhas.app' } });
  if (!clara) {
    console.log('User not found');
    return;
  }

  const startDate = new Date(2026, 2, 1); // March 2026
  const endDate = new Date(2026, 3, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: clara.id,
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  console.log(`Total transactions for March 2026: ${transactions.length}`);
  
  const byMethod: Record<string, number> = {};
  transactions.forEach(t => {
    const method = t.paymentMethod || 'NULL';
    byMethod[method] = (byMethod[method] || 0) + Math.abs(t.amount);
  });

  console.log('Transactions by Payment Method (Sum of absolute amounts):');
  console.log(JSON.stringify(byMethod, null, 2));

  // Check specific transactions
  const rent = transactions.find(t => t.description.includes('Aluguel'));
  console.log('Rent Transaction:', JSON.stringify(rent, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
