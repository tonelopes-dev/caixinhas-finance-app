const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function clearDatabaseInteractive() {
  try {
    console.log('🚨 LIMPEZA COMPLETA DO BANCO DE DADOS');
    console.log('=====================================');
    console.log('⚠️  Esta ação irá APAGAR TODOS os dados do banco!');
    console.log('📊 Banco:', process.env.DATABASE_URL ? 'PostgreSQL (Neon)' : 'Local');
    console.log('');

    // Mostrar contagem atual
    const counts = {};
    const models = ['User', 'Vault', 'vaultMember', 'Account', 'Goal', 'Transaction', 'Invitation', 'Notification'];
    
    console.log('📈 Dados atuais no banco:');
    for (const model of models) {
      try {
        const count = await prisma[model.toLowerCase()].count();
        counts[model] = count;
        console.log(`   ${model}: ${count} registros`);
      } catch (error) {
        console.log(`   ${model}: erro ao contar`);
      }
    }
    console.log('');

    const confirm1 = await askQuestion('Digite "CONFIRMAR" para continuar: ');
    if (confirm1 !== 'CONFIRMAR') {
      console.log('❌ Operação cancelada.');
      rl.close();
      return;
    }

    const confirm2 = await askQuestion('Tem certeza? Digite "SIM" para apagar TODOS os dados: ');
    if (confirm2 !== 'SIM') {
      console.log('❌ Operação cancelada.');
      rl.close();
      return;
    }

    rl.close();

    console.log('\n🧹 Iniciando limpeza...');
    
    // Ordem de exclusão baseada nas foreign keys
    const deleteOrder = [
      'Transaction',
      'Invitation', 
      'Notification',
      'Goal',
      'Account',
      'vaultMember', // Corrigido de 'VaultMember' para 'vaultMember'
      'Vault',
      'User'
    ];

    let totalDeleted = 0;
    for (const model of deleteOrder) {
      const count = counts[model] || 0;
      if (count > 0) {
        await prisma[model.toLowerCase()].deleteMany({});
        console.log(`✅ ${count} registros de ${model} removidos`);
        totalDeleted += count;
      }
    }

    console.log(`\n🎉 Limpeza concluída! ${totalDeleted} registros removidos no total.`);
    console.log('💡 Para recriar os dados, execute: npm run db:seed');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabaseInteractive();
