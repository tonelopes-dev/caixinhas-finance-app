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

    console.log('📈 Dados atuais no banco:');
    const counts: { [key: string]: number } = {};
    for (const model of models) {
      try {
        const count = await prisma[model].count();
        counts[model] = count;
        console.log(`   ${modelDisplayNames[model]}: ${count} registros`);
      } catch (error) {
        console.log(`   ${modelDisplayNames[model]}: erro ao contar`);
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
    
    let totalDeleted = 0;
    for (const model of models) {
      const count = counts[model] || 0;
      if (count > 0) {
        await prisma[model].deleteMany({});
        console.log(`✅ ${count} registros de ${modelDisplayNames[model]} removidos`);
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
