const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🧹 Iniciando limpeza completa do banco de dados...\n');
    
    // Ordem de exclusão baseada nas foreign keys
    const deleteOrder = [
      'Transaction',
      'Invitation', 
      'Notification',
      'Goal',
      'Account',
      'VaultMember',
      'Vault',
      'User'
    ];

    for (const model of deleteOrder) {
      const count = await prisma[model.toLowerCase()].count();
      if (count > 0) {
        await prisma[model.toLowerCase()].deleteMany({});
        console.log(`✅ ${count} registros de ${model} removidos`);
      } else {
        console.log(`ℹ️  Nenhum registro de ${model} encontrado`);
      }
    }

    console.log('\n🎉 Limpeza do banco de dados concluída com sucesso!');
    console.log('💡 Para recriar os dados, execute: npm run seed');
    
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