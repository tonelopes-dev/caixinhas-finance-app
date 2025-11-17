const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🧹 Iniciando limpeza completa do banco de dados...\n');
    
    // Ordem de exclusão para respeitar as foreign keys
    const models = [
      'transaction',
      'invitation',
      'notification',
      'goalParticipant',
      'goal',
      'account',
      'vaultMember',
      'vault',
      'user'
    ];

    // Nomes para exibição (PascalCase)
    const modelDisplayNames: { [key: string]: string } = {
        transaction: 'Transaction',
        invitation: 'Invitation',
        notification: 'Notification',
        goalParticipant: 'GoalParticipant',
        goal: 'Goal',
        account: 'Account',
        vaultMember: 'VaultMember',
        vault: 'Vault',
        user: 'User'
    }

    for (const model of models) {
      const count = await prisma[model].count();
      if (count > 0) {
        await prisma[model].deleteMany({});
        console.log(`✅ ${count} registros de ${modelDisplayNames[model]} removidos`);
      } else {
        console.log(`ℹ️  Nenhum registro de ${modelDisplayNames[model]} encontrado`);
      }
    }

    console.log('\n🎉 Limpeza do banco de dados concluída com sucesso!');
    console.log('💡 Para recriar os dados, execute: npm run db:seed');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  console.log('⚠️  ATENÇÃO: Este script irá apagar TODOS os dados do banco!');
  console.log('📊 Banco de dados:', process.env.DATABASE_URL ? 'PostgreSQL (Neon)' : 'Local');
  console.log('⏳ Iniciando em 3 segundos...\n');
  
  setTimeout(() => {
    clearDatabase();
  }, 3000);
}

module.exports = { clearDatabase };
