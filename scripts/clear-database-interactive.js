
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

    console.log('📈 Dados atuais no banco:');
    const counts = {};
    for (const modelName of models) {
        const displayName = modelDisplayNames[modelName] || modelName;
        const prismaModel = prisma[modelName];
      try {
        if (prismaModel && typeof prismaModel.count === 'function') {
            const count = await prismaModel.count();
            counts[modelName] = count;
            console.log(`   ${displayName}: ${count} registros`);
        } else {
            console.log(`   ${displayName}: modelo não encontrado no Prisma.`);
            counts[modelName] = 0;
        }
      } catch (error) {
        console.log(`   ${displayName}: erro ao contar`);
        counts[modelName] = 0;
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
    for (const modelName of models) {
      const count = counts[modelName] || 0;
      const displayName = modelDisplayNames[modelName] || modelName;
      if (count > 0) {
        const prismaModel = prisma[modelName];
        await prismaModel.deleteMany({});
        console.log(`✅ ${count} registros de ${displayName} removidos`);
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
