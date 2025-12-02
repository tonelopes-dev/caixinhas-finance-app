import { prisma } from '@/services/prisma';

async function debugTransactions() {
  try {
    // Buscar todas as transações
    const transactions = await prisma.transaction.findMany({
      select: {
        id: true,
        description: true,
        amount: true,
        actorId: true,
        userId: true,
        vaultId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log('🔍 Total de transações no banco:', transactions.length);
    
    if (transactions.length > 0) {
      console.log('📊 Últimas transações:');
      transactions.forEach((t, index) => {
        console.log(`${index + 1}. ${t.description} - R$ ${t.amount}`);
        console.log(`   actorId: ${t.actorId}, userId: ${t.userId}, vaultId: ${t.vaultId}`);
        console.log(`   criada em: ${t.createdAt}`);
      });
    } else {
      console.log('❌ Nenhuma transação encontrada no banco');
    }

    // Buscar usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 5
    });

    console.log('👤 Usuários no banco:', users.length);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) - ID: ${u.id}`);
    });

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

debugTransactions();