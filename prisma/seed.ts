
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
    await prisma.notification.deleteMany({});
    await prisma.invitation.deleteMany({});
    await prisma.goalParticipant.deleteMany({});
    await prisma.goal.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.vaultMember.deleteMany({});
    await prisma.vault.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.category.deleteMany({});
    
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
    console.log(`✅ Usuário criado: ${mainUser.name} (${mainUser.email}) com trial até ${mainUser.trialExpiresAt?.toLocaleDateString()}`);

    // ============================================
    // 3. CRIAR USUÁRIOS ADICIONAIS PARA TESTES
    // ============================================
    console.log('👥 Criando usuários adicionais para testes...');
    
    const additionalUsersData: CreateUserInput[] = [
      {
        name: 'Ana Silva',
        email: 'ana@teste.com',
        password: 'ana123',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
      },
      {
        name: 'Carlos Santos',
        email: 'carlos@teste.com',
        password: 'carlos123',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      },
       {
        name: 'Julia Mendes (Sem Cofre)',
        email: 'julia@teste.com',
        password: 'julia123',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400'
      }
    ];
    
    const additionalUsers = await Promise.all(additionalUsersData.map(AuthService.register));

    console.log(`✅ ${additionalUsers.length} usuários adicionais criados`);

    // ============================================
    // 4. CRIAR CONTAS PESSOAIS (ACCOUNT SERVICE)
    // ============================================
    console.log('💳 Criando contas bancárias...');
    
    const mainUserAccounts = await Promise.all([
      AccountService.createAccount({ name: 'Conta Corrente Principal', bank: 'Nubank', type: 'checking', balance: 15000.50, logoUrl: bankLogos[0], scope: 'personal', ownerId: mainUser.id }),
      AccountService.createAccount({ name: 'Poupança Reserva', bank: 'Inter', type: 'savings', balance: 25000.00, logoUrl: bankLogos[1], scope: 'personal', ownerId: mainUser.id }),
      AccountService.createAccount({ name: 'Carteira de Investimentos', bank: 'C6 Bank', type: 'investment', balance: 50000.75, logoUrl: bankLogos[2], scope: 'personal', ownerId: mainUser.id }),
      AccountService.createAccount({ name: 'Cartão de Crédito', bank: 'Itaú', type: 'credit_card', balance: -1200.00, creditLimit: 8000.00, logoUrl: bankLogos[3], scope: 'personal', ownerId: mainUser.id })
    ]);

    const anaAccounts = await Promise.all([
      AccountService.createAccount({ name: 'Conta Ana', bank: 'Bradesco', type: 'checking', balance: 8500.00, logoUrl: bankLogos[4], scope: 'personal', ownerId: additionalUsers[0].id })
    ]);

    const carlosAccounts = await Promise.all([
      AccountService.createAccount({ name: 'Conta Carlos', bank: 'Banco do Brasil', type: 'checking', balance: 12000.00, logoUrl: bankLogos[5], scope: 'personal', ownerId: additionalUsers[1].id })
    ]);

    console.log(`✅ ${mainUserAccounts.length + anaAccounts.length + carlosAccounts.length} contas pessoais criadas`);

    // ============================================
    // 5. CRIAR VAULTS (VAULT SERVICE)
    // ============================================
    console.log('🏦 Criando cofres compartilhados...');
    
    const familyVault = await VaultService.createVault({ name: 'Cofre da Família', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', ownerId: mainUser.id });
    await VaultService.addMember(familyVault.id, additionalUsers[0].id, 'member');
    
    const businessVault = await VaultService.createVault({ name: 'Negócios e Investimentos', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', ownerId: mainUser.id });
    
    console.log('✅ 2 cofres criados');

    // ============================================
    // 6. CRIAR CONTAS DE VAULT
    // ============================================
    console.log('🏪 Criando contas dos cofres...');
    
    const vaultAccounts = await Promise.all([
      AccountService.createAccount({ name: 'Conta Conjunta Família', bank: 'Caixa Econômica', type: 'checking', balance: 18000.00, logoUrl: bankLogos[6], scope: 'vault', ownerId: mainUser.id, vaultId: familyVault.id }),
      AccountService.createAccount({ name: 'Conta Empresarial', bank: 'Itaú', type: 'checking', balance: 35000.00, logoUrl: bankLogos[3], scope: 'vault', ownerId: mainUser.id, vaultId: businessVault.id })
    ]);

    console.log(`✅ ${vaultAccounts.length} contas de cofre criadas`);

    // ============================================
    // 7. CRIAR GOALS/CAIXINHAS (GOAL SERVICE)
    // ============================================
    console.log('🎯 Criando caixinhas/metas...');
    
    const personalGoals = await Promise.all([
      GoalService.createGoal({ name: 'Viagem para Europa', targetAmount: 20000.00, emoji: '✈️', visibility: 'private', ownerId: mainUser.id, ownerType: 'user', currentAmount: 2500 }),
      GoalService.createGoal({ name: 'Novo Notebook', targetAmount: 8000.00, emoji: '💻', visibility: 'shared', ownerId: mainUser.id, ownerType: 'user', currentAmount: 1200 })
    ]);

    const vaultGoals = await Promise.all([
      GoalService.createGoal({ name: 'Reforma da Casa', targetAmount: 50000.00, emoji: '🏠', visibility: 'shared', ownerId: familyVault.id, ownerType: 'vault', currentAmount: 15000 }),
      GoalService.createGoal({ name: 'Investimento Coletivo', targetAmount: 100000.00, emoji: '📈', visibility: 'shared', ownerId: businessVault.id, ownerType: 'vault', currentAmount: 75000 })
    ]);

    console.log(`✅ ${personalGoals.length + vaultGoals.length} caixinhas criadas`);
    
    // ============================================
    // 8. CRIAR TRANSAÇÕES (TRANSACTION SERVICE)
    // ============================================
    console.log('💸 Criando transações de exemplo...');

    await TransactionService.createTransaction({
      userId: mainUser.id,
      date: new Date(),
      description: 'Salário de Novembro',
      amount: 7500,
      type: 'income',
      category: 'Salário',
      actorId: mainUser.id,
      destinationAccountId: mainUserAccounts[0].id,
      isRecurring: true,
    });

    await TransactionService.createTransaction({
      vaultId: familyVault.id,
      date: new Date(),
      description: 'Aluguel do Apartamento',
      amount: 2800,
      type: 'expense',
      category: 'Moradia',
      actorId: mainUser.id,
      sourceAccountId: vaultAccounts[0].id,
      isRecurring: true,
    });

    await TransactionService.createTransaction({
      userId: mainUser.id,
      date: new Date(),
      description: 'Compra do Celular Novo',
      amount: 4800,
      type: 'expense',
      category: 'Eletrônicos',
      actorId: mainUser.id,
      sourceAccountId: mainUserAccounts[3].id, // Cartão de Crédito
      isInstallment: true,
      totalInstallments: 12,
      installmentNumber: 1, // Representa a compra inicial
      paidInstallments: 1,
    });
    
    await TransactionService.createTransaction({
      userId: mainUser.id,
      date: new Date(),
      description: 'Depósito na Caixinha da Viagem',
      amount: 500,
      type: 'transfer',
      category: 'Caixinha',
      actorId: mainUser.id,
      sourceAccountId: mainUserAccounts[0].id,
      goalId: personalGoals[0].id,
    });

    console.log('✅ Transações criadas');


    // ============================================
    // 9. CRIAR CONVITES (VAULT SERVICE)
    // ============================================
    console.log('📧 Criando convites...');
    
    // Convite para um usuário existente
    await VaultService.createInvitation(businessVault.id, mainUser.id, additionalUsers[1].email);
    
    // Criar um convite para o usuário 'Carlos' para o cofre da família
    await prisma.invitation.create({
        data: {
          type: 'vault',
          targetId: familyVault.id,
          targetName: familyVault.name,
          senderId: mainUser.id,
          receiverId: additionalUsers[1].id,
          status: 'pending'
        }
    });

    console.log('✅ Convites criados');


    // ============================================
    // 10. ESTATÍSTICAS FINAIS
    // ============================================
    console.log('\n📊 RESUMO DO SEED:');
    console.log('==================');
    
    const stats = {
      users: await prisma.user.count(),
      vaults: await prisma.vault.count(),
      accounts: await prisma.account.count(),
      goals: await prisma.goal.count(),
      invitations: await prisma.invitation.count(),
      transactions: await prisma.transaction.count(),
      categories: await prisma.category.count(),
    };

    Object.entries(stats).forEach(([key, count]) => {
      console.log(`${key.padEnd(15)}: ${count}`);
    });

    console.log('\n🔐 CREDENCIAIS DE LOGIN:');
    console.log('========================');
    console.log('Email: conta01@email.com | Senha: conta@123');
    console.log('Email: ana@teste.com | Senha: ana123');
    console.log('Email: carlos@teste.com | Senha: carlos123');
    console.log('Email: julia@teste.com | Senha: julia123');

    console.log('\n🎉 SEED COMPLETO - DADOS DE TESTE PRONTOS!');

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
