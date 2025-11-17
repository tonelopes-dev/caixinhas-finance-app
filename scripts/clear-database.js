
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🧹 Iniciando limpeza completa do banco de dados...\n');
    
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

    const modelDisplayNames = {
        transaction: 'Transaction',
        invitation: 'Invitation',
        notification: 'Notification',
        goalParticipant: 'GoalParticipant',
        goal: 'Goal',
        account: 'Account',
        vaultMember: 'VaultMember',
        vault: 'Vault',
        user: 'User'
    };

    for (const modelName of models) {
        const displayName = modelDisplayNames[modelName] || modelName;
        const prismaModel = prisma[modelName];

      if (prismaModel && typeof prismaModel.count === 'function') {
        const count = await prismaModel.count();
        if (count > 0) {
            await prismaModel.deleteMany({});
            console.log(`✅ ${count} registros de ${displayName} removidos`);
        } else {
            console.log(`ℹ️  Nenhum registro de ${displayName} encontrado`);
        }
      } else {
        console.warn(`⚠️  Modelo '${modelName}' não encontrado no cliente Prisma. Pulando.`);
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

if (require.main === module) {
  console.log('⚠️  ATENÇÃO: Este script irá apagar TODOS os dados do banco!');
  console.log('📊 Banco de dados:', process.env.DATABASE_URL ? 'PostgreSQL (Neon)' : 'Local');
  console.log('⏳ Iniciando em 3 segundos...\n');
  
  setTimeout(() => {
    clearDatabase();
  }, 3000);
}

module.exports = { clearDatabase };
