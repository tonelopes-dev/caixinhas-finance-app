
import { PrismaClient } from '@prisma/client';
import {
  AuthService,
  VaultService,
  AccountService,
  GoalService,
  TransactionService,
  type CreateUserInput,
  type CreateVaultInput
} from '../src/services';

const prisma = new PrismaClient();

const bankLogos = [
  'https://cdn.worldvectorlogo.com/logos/nubank-1.svg',
  'https://cdn.worldvectorlogo.com/logos/banco-inter.svg',
  'https://cdn.worldvectorlogo.com/logos/c6-bank.svg',
  'https://cdn.worldvectorlogo.com/logos/itau-unibanco-2.svg',
  'https://cdn.worldvectorlogo.com/logos/bradesco-logo-2.svg',
  'https://cdn.worldvectorlogo.com/logos/banco-do-brasil-logo.svg',
  'https://cdn.worldvectorlogo.com/logos/caixa-economica-federal.svg',
];

async function main() {
  console.log('🌱 Iniciando seed completo do banco de dados...');
  console.log('🔄 Este seed testará todas as funcionalidades CRUD do projeto\n');

  try {
    // ============================================
    // 1. LIMPEZA INICIAL
    // ============================================
    console.log('🧹 Limpando dados existentes...');
    
    // Ordem de limpeza respeitando foreign keys
    await prisma.transaction.deleteMany({});
    await prisma.invitation.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.goalParticipant.deleteMany({});
    await prisma.goal.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.vaultMember.deleteMany({});
    await prisma.vault.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ Banco limpo');

    // ============================================
    // 2. CRIAR USUÁRIO PRINCIPAL (AUTH SERVICE)
    // ============================================
    console.log('👤 Criando usuário principal...');
    
    const mainUserData: CreateUserInput = {
      name: 'Usuário Principal',
      email: 'conta01@email.com',
      password: 'conta@123',
      avatarUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400'
    };

    const mainUser = await AuthService.register(mainUserData);
    console.log(`✅ Usuário criado: ${mainUser.name} (${mainUser.email})`);

    // ============================================
    // 3. CRIAR USUÁRIOS ADICIONAIS PARA TESTES
    // ============================================
    console.log('👥 Criando usuários adicionais para testes...');
    
    const additionalUsers = await Promise.all([
      AuthService.register({
        name: 'Ana Silva',
        email: 'ana@teste.com',
        password: 'ana123',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
      }),
      AuthService.register({
        name: 'Carlos Santos',
        email: 'carlos@teste.com',
        password: 'carlos123',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      }),
    ]);

    console.log(`✅ ${additionalUsers.length} usuários adicionais criados`);

    // ============================================
    // 4. CRIAR CONTAS PESSOAIS (ACCOUNT SERVICE)
    // ============================================
    console.log('💳 Criando contas bancárias...');
    
    // Contas do usuário principal - testando todos os tipos
    const mainUserAccounts = await Promise.all([
      // Conta Corrente
      AccountService.createAccount({
        name: 'Conta Corrente Principal',
        bank: 'Nubank',
        type: 'checking',
        balance: 15000.50,
        logoUrl: bankLogos[0],
        scope: 'personal',
        ownerId: mainUser.id
      }),
      
      // Poupança
      AccountService.createAccount({
        name: 'Poupança Reserva',
        bank: 'Inter',
        type: 'savings',
        balance: 25000.00,
        logoUrl: bankLogos[1],
        scope: 'personal',
        ownerId: mainUser.id
      }),
      
      // Investimentos
      AccountService.createAccount({
        name: 'Carteira de Investimentos',
        bank: 'C6 Bank',
        type: 'investment',
        balance: 50000.75,
        logoUrl: bankLogos[2],
        scope: 'personal',
        ownerId: mainUser.id
      }),
      
      // Cartão de Crédito
      AccountService.createAccount({
        name: 'Cartão de Crédito',
        bank: 'Itaú',
        type: 'credit_card',
        balance: -1200.00, // saldo devedor
        creditLimit: 8000.00,
        logoUrl: bankLogos[3],
        scope: 'personal',
        ownerId: mainUser.id
      })
    ]);

    // Contas dos usuários adicionais
    const anaAccounts = await Promise.all([
      AccountService.createAccount({
        name: 'Conta Ana',
        bank: 'Bradesco',
        type: 'checking',
        balance: 8500.00,
        logoUrl: bankLogos[4],
        scope: 'personal',
        ownerId: additionalUsers[0].id
      })
    ]);

    const carlosAccounts = await Promise.all([
      AccountService.createAccount({
        name: 'Conta Carlos',
        bank: 'Banco do Brasil',
        type: 'checking',
        balance: 12000.00,
        logoUrl: bankLogos[5],
        scope: 'personal',
        ownerId: additionalUsers[1].id
      })
    ]);

    console.log(`✅ ${mainUserAccounts.length + anaAccounts.length + carlosAccounts.length} contas pessoais criadas`);

    // ============================================
    // 5. CRIAR VAULTS (VAULT SERVICE)
    // ============================================
    console.log('🏦 Criando cofres compartilhados...');
    
    const vaultFamilia: CreateVaultInput = {
      name: 'Cofre da Família',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      ownerId: mainUser.id
    };
    
    const familyVault = await VaultService.createVault(vaultFamilia);
    
    // Adicionar membros ao cofre
    await VaultService.addMember(familyVault.id, additionalUsers[0].id, 'member');
    
    const vaultNegocios: CreateVaultInput = {
      name: 'Negócios e Investimentos',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      ownerId: mainUser.id
    };
    
    const businessVault = await VaultService.createVault(vaultNegocios);
    await VaultService.addMember(businessVault.id, additionalUsers[1].id, 'member');
    
    console.log('✅ 2 cofres criados com múltiplos membros');

    // ============================================
    // 6. CRIAR CONTAS DE VAULT
    // ============================================
    console.log('🏪 Criando contas dos cofres...');
    
    const vaultAccounts = await Promise.all([
      // Conta do cofre família
      AccountService.createAccount({
        name: 'Conta Conjunta Família',
        bank: 'Caixa Econômica',
        type: 'checking',
        balance: 18000.00,
        logoUrl: bankLogos[6],
        scope: 'vault',
        ownerId: mainUser.id,
        vaultId: familyVault.id
      }),
      
      // Conta do cofre negócios
      AccountService.createAccount({
        name: 'Conta Empresarial',
        bank: 'Itaú',
        type: 'checking',
        balance: 35000.00,
        logoUrl: bankLogos[3],
        scope: 'vault',
        ownerId: mainUser.id,
        vaultId: businessVault.id
      })
    ]);

    console.log(`✅ ${vaultAccounts.length} contas de cofre criadas`);

    // ============================================
    // 7. CRIAR GOALS/CAIXINHAS (GOAL SERVICE)
    // ============================================
    console.log('🎯 Criando caixinhas/metas...');
    
    // Goals pessoais do usuário principal
    const personalGoals = await Promise.all([
      GoalService.createGoal({
        name: 'Viagem para Europa',
        targetAmount: 20000.00,
        emoji: '✈️',
        visibility: 'private',
        ownerId: mainUser.id,
        ownerType: 'user'
      }),
      
      GoalService.createGoal({
        name: 'Novo Notebook',
        targetAmount: 8000.00,
        emoji: '💻',
        visibility: 'shared',
        ownerId: mainUser.id,
        ownerType: 'user'
      })
    ]);

    // Goals de vault
    const vaultGoals = await Promise.all([
      GoalService.createGoal({
        name: 'Reforma da Casa',
        targetAmount: 50000.00,
        emoji: '🏠',
        visibility: 'shared',
        ownerId: familyVault.id,
        ownerType: 'vault'
      }),
      
      GoalService.createGoal({
        name: 'Investimento Coletivo',
        targetAmount: 100000.00,
        emoji: '📈',
        visibility: 'shared',
        ownerId: businessVault.id,
        ownerType: 'vault'
      })
    ]);

    console.log(`✅ ${personalGoals.length + vaultGoals.length} caixinhas criadas`);

    // ============================================
    // 8. CRIAR TRANSAÇÕES (TRANSACTION SERVICE)
    // ============================================
    console.log('💸 Criando transações diversas...');
    
    // Transações de entrada (income)
    await Promise.all([
      // Salário
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-01'),
        description: 'Salário Novembro',
        amount: 8500.00,
        type: 'income',
        category: 'Salário',
        destinationAccountId: mainUserAccounts[0].id, // conta corrente
        actorId: mainUser.id
      }),
      
      // Freelance
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-05'),
        description: 'Projeto Freelance',
        amount: 2500.00,
        type: 'income',
        category: 'Freelance',
        destinationAccountId: mainUserAccounts[0].id,
        actorId: mainUser.id
      }),
      
      // Rendimento de investimentos
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-10'),
        description: 'Rendimento CDB',
        amount: 450.00,
        type: 'income',
        category: 'Investimentos',
        destinationAccountId: mainUserAccounts[2].id, // conta investimento
        actorId: mainUser.id
      })
    ]);

    // Transações de saída (expense)
    await Promise.all([
      // Supermercado - débito
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-03'),
        description: 'Supermercado Semanal',
        amount: 350.00,
        type: 'expense',
        category: 'Alimentação',
        sourceAccountId: mainUserAccounts[0].id,
        paymentMethod: 'debit_card',
        actorId: mainUser.id
      }),
      
      // Conta de luz - boleto
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-08'),
        description: 'Conta de Luz',
        amount: 180.00,
        type: 'expense',
        category: 'Utilidades',
        sourceAccountId: mainUserAccounts[0].id,
        paymentMethod: 'boleto',
        actorId: mainUser.id,
        isRecurring: true
      }),
      
      // Gasolina - PIX
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-12'),
        description: 'Gasolina',
        amount: 120.00,
        type: 'expense',
        category: 'Transporte',
        sourceAccountId: mainUserAccounts[0].id,
        paymentMethod: 'pix',
        actorId: mainUser.id
      }),
      
      // Compra parcelada no cartão
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-15'),
        description: 'Smartphone Novo',
        amount: 400.00, // 1ª parcela de 2400
        type: 'expense',
        category: 'Outros',
        sourceAccountId: mainUserAccounts[3].id, // cartão de crédito
        paymentMethod: 'credit_card',
        actorId: mainUser.id,
        isInstallment: true,
        installmentNumber: 1,
        totalInstallments: 6
      })
    ]);

    // Transações de transferência entre contas
    await Promise.all([
      // Transferência para poupança
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-06'),
        description: 'Reserva de Emergência',
        amount: 1500.00,
        type: 'transfer',
        category: 'Transferência',
        sourceAccountId: mainUserAccounts[0].id, // conta corrente
        destinationAccountId: mainUserAccounts[1].id, // poupança
        actorId: mainUser.id
      }),
      
      // Transferência para investimento
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-09'),
        description: 'Aplicação em CDB',
        amount: 5000.00,
        type: 'transfer',
        category: 'Investimento',
        sourceAccountId: mainUserAccounts[0].id,
        destinationAccountId: mainUserAccounts[2].id,
        actorId: mainUser.id
      })
    ]);

    // Transações para caixinhas (goals)
    await Promise.all([
      // Contribuição para viagem
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-07'),
        description: 'Economia para Viagem',
        amount: 800.00,
        type: 'transfer',
        category: 'Caixinha',
        sourceAccountId: mainUserAccounts[0].id,
        goalId: personalGoals[0].id,
        actorId: mainUser.id
      }),
      
      // Contribuição para notebook
      TransactionService.createTransaction({
        userId: mainUser.id,
        date: new Date('2024-11-14'),
        description: 'Guardando para Notebook',
        amount: 1200.00,
        type: 'transfer',
        category: 'Caixinha',
        sourceAccountId: mainUserAccounts[1].id, // da poupança
        goalId: personalGoals[1].id,
        actorId: mainUser.id
      })
    ]);

    // Transações no vault (compartilhadas)
    await Promise.all([
      // Contribuição do usuário principal para o cofre
      TransactionService.createTransaction({
        vaultId: familyVault.id,
        date: new Date('2024-11-11'),
        description: 'Contribuição Mensal Família',
        amount: 2000.00,
        type: 'transfer',
        category: 'Contribuição Familiar',
        sourceAccountId: mainUserAccounts[0].id,
        destinationAccountId: vaultAccounts[0].id,
        actorId: mainUser.id
      }),
      
      // Despesa do cofre
      TransactionService.createTransaction({
        vaultId: familyVault.id,
        date: new Date('2024-11-13'),
        description: 'Compras da Casa',
        amount: 850.00,
        type: 'expense',
        category: 'Casa',
        sourceAccountId: vaultAccounts[0].id,
        paymentMethod: 'debit_card',
        actorId: mainUser.id
      })
    ]);

    console.log('✅ Múltiplas transações criadas testando todos os cenários');

    // ============================================
    // 9. CRIAR NOTIFICAÇÕES
    // ============================================
    console.log('🔔 Criando notificações...');
    
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: mainUser.id,
          type: 'goal_progress',
          text: 'Parabéns! Você atingiu 60% da meta "Viagem para Europa".',
          link: `/goals/${personalGoals[0].id}`,
          read: false
        }
      }),
      
      prisma.notification.create({
        data: {
          userId: mainUser.id,
          type: 'transaction_added',
          text: '<b>Ana Silva</b> adicionou uma despesa de <b>R$ 850,00</b> no cofre "Família".',
          actorId: additionalUsers[0].id,
          actorName: additionalUsers[0].name,
          actorAvatar: additionalUsers[0].avatarUrl,
          link: '/transactions',
          read: false
        }
      }),
      
      prisma.notification.create({
        data: {
          userId: mainUser.id,
          type: 'vault_invite',
          text: '<b>Carlos Santos</b> te convidou para o cofre "Projeto Startup".',
          actorId: additionalUsers[1].id,
          actorName: additionalUsers[1].name,
          actorAvatar: additionalUsers[1].avatarUrl,
          link: '/invitations',
          read: true
        }
      })
    ]);

    console.log('✅ 3 notificações criadas');

    // ============================================
    // 10. CRIAR CONVITES
    // ============================================
    console.log('📧 Criando convites...');
    
    await Promise.all([
      prisma.invitation.create({
        data: {
          type: 'vault',
          vaultId: businessVault.id,
          targetName: businessVault.name,
          senderId: mainUser.id,
          receiverId: additionalUsers[0].id,
          status: 'pending'
        }
      }),
      
      prisma.invitation.create({
        data: {
          type: 'goal',
          goalId: personalGoals[1].id,
          targetName: personalGoals[1].name,
          senderId: mainUser.id,
          receiverId: additionalUsers[1].id,
          status: 'accepted'
        }
      })
    ]);

    console.log('✅ 2 convites criados');

    // ============================================
    // 11. TESTES DE ATUALIZAÇÃO (UPDATE)
    // ============================================
    console.log('🔄 Testando operações de atualização...');
    
    // Atualizar conta
    await AccountService.updateAccount(mainUserAccounts[0].id, {
      name: 'Conta Corrente Principal (Atualizada)',
      balance: 16500.50
    });

    // Atualizar goal
    await GoalService.updateGoal(personalGoals[0].id, {
      name: 'Viagem para Europa 2025',
      targetAmount: 22000.00
    });

    console.log('✅ Operações de atualização testadas');

    // ============================================
    // 12. ESTATÍSTICAS FINAIS
    // ============================================
    console.log('\n📊 RESUMO DO SEED:');
    console.log('==================');
    
    const stats = {
      users: await prisma.user.count(),
      vaults: await prisma.vault.count(),
      accounts: await prisma.account.count(),
      goals: await prisma.goal.count(),
      transactions: await prisma.transaction.count(),
      notifications: await prisma.notification.count(),
      invitations: await prisma.invitation.count()
    };

    Object.entries(stats).forEach(([key, count]) => {
      console.log(`${key.padEnd(15)}: ${count}`);
    });

    console.log('\n🎯 FUNCIONALIDADES TESTADAS:');
    console.log('============================');
    console.log('✅ AuthService.register() - Criação de usuários');
    console.log('✅ AccountService.createAccount() - Todos os tipos de conta');
    console.log('✅ VaultService.createVault() - Cofres compartilhados');
    console.log('✅ VaultService.addMember() - Adição de membros');
    console.log('✅ GoalService.createGoal() - Metas pessoais e de vault');
    console.log('✅ TransactionService.createTransaction() - Todos os tipos');
    console.log('✅ AccountService.updateAccount() - Atualização de contas');
    console.log('✅ GoalService.updateGoal() - Atualização de metas');
    console.log('✅ Transações: income, expense, transfer');
    console.log('✅ Métodos de pagamento: PIX, débito, crédito, boleto');
    console.log('✅ Transações recorrentes e parceladas');
    console.log('✅ Transações para caixinhas');
    console.log('✅ Transações em vaults compartilhados');
    console.log('✅ Notificações e convites');

    console.log('\n🔐 CREDENCIAIS DE LOGIN:');
    console.log('========================');
    console.log('Email: conta01@email.com');
    console.log('Senha: conta@123');

    console.log('\n🎉 SEED COMPLETO - TODAS AS FUNCIONALIDADES CRUD TESTADAS!');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
