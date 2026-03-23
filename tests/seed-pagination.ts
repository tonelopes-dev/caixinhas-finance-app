import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const testEmail = 'clara@caixinhas.app';
  
  const user = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { 
      ownedAccounts: true,
      memberships: {
        include: { vault: true }
      }
    }
  });

  if (!user) throw new Error('Test user not found');

  const personalVault = user.memberships.find(m => m.vault.isPrivate)?.vaultId;
  const account = user.ownedAccounts[0];

  if (!personalVault || !account) throw new Error('Test user needs a personal vault and an account');

  const category = await prisma.category.findFirst({ where: { ownerId: user.id } });
  if (!category) throw new Error('Test user needs at least one category');

  console.log('🌱 Seeding 15 test transactions...');
  
  for (let i = 1; i <= 15; i++) {
    await prisma.transaction.create({
      data: {
        description: `Transaction Pagination Test ${i.toString().padStart(2, '0')}`,
        amount: 10 + i,
        type: 'expense',
        date: new Date(2026, 0, i), // Jan 2026
        userId: user.id,
        actorId: user.id,
        vaultId: personalVault,
        sourceAccountId: account.id,
        categoryId: category.id
      }
    });
  }
  console.log('✅ Seed completed');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
