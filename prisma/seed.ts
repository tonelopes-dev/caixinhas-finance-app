
import { PrismaClient } from '@prisma/client';

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
  console.log('🌱 Iniciando seed do banco de dados...');

  // ============================================
  // 1. CRIAR USUÁRIOS
  // ============================================
  console.log('👥 Criando usuários...');

  const user1 = await prisma.user.create({
    data: {
      id: 'user1',
      name: 'Dev',
      email: 'email01@conta.com',
      avatarUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=1080',
      subscriptionStatus: 'active',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user2',
      name: 'Anna',
      email: 'email02@conta.com',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080',
      subscriptionStatus: 'active',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'user3',
      name: 'Carlos',
      email: 'carlos@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080',
      subscriptionStatus: 'inactive',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      id: 'user4',
      name: 'Daniela',
      email: 'daniela@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1080',
      subscriptionStatus: 'active',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      id: 'user5',
      name: 'Eduardo',
      email: 'eduardo@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1080',
      subscriptionStatus: 'trial',
    },
  });

  console.log(`✅ 5 usuários criados`);

  // ============================================
  // 2. CRIAR VAULTS (COFRES)
  // ============================================
  console.log('🏦 Criando cofres...');

  const vaultFamily = await prisma.vault.create({
    data: {
      id: 'vault-family',
      name: 'Família DevAnna',
      ownerId: user1.id,
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080',
      members: {
        create: [
          { userId: user1.id, role: 'owner' },
          { userId: user2.id, role: 'member' },
        ],
      },
    },
  });

  const vaultAgency = await prisma.vault.create({
    data: {
      id: 'vault-agency',
      name: 'Agência de Software',
      ownerId: user1.id,
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080',
      members: {
        create: [{ userId: user1.id, role: 'owner' }],
      },
    },
  });

  const vaultOffice = await prisma.vault.create({
    data: {
      id: 'vault-office',
      name: 'Consultório Anna',
      ownerId: user2.id,
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1080',
      members: {
        create: [{ userId: user2.id, role: 'owner' }],
      },
    },
  });

  const vaultTrip = await prisma.vault.create({
    data: {
      id: 'vault-trip',
      name: 'Viagem para o Japão',
      ownerId: user1.id,
      imageUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1080',
      members: {
        create: [
          { userId: user1.id, role: 'owner' },
          { userId: user2.id, role: 'member' },
        ],
      },
    },
  });

  console.log('✅ 4 cofres criados');

  // ============================================
  // 3. CRIAR CONTAS
  // ============================================
  console.log('💳 Criando contas...');

  const accDev1 = await prisma.account.create({
    data: { id: 'acc-dev-1', ownerId: user1.id, scope: 'personal', visibleIn: 'vault-family', name: 'Conta Corrente Pessoal', bank: 'Banco Digital', type: 'checking', balance: 12500, logoUrl: bankLogos[0] }
  });
  const accDev2 = await prisma.account.create({
    data: { id: 'acc-dev-2', ownerId: user1.id, scope: 'personal', name: 'Investimentos Pessoais', bank: 'Corretora Ágil', type: 'investment', balance: 75000, logoUrl: bankLogos[2] }
  });
  const accDev3 = await prisma.account.create({
    data: { id: 'acc-dev-3', ownerId: user1.id, scope: 'personal', name: 'Cartão Pessoal', bank: 'Banco Digital', type: 'credit_card', balance: 0, creditLimit: 15000, logoUrl: bankLogos[0] }
  });
  const accNutri1 = await prisma.account.create({
    data: { id: 'acc-nutri-1', ownerId: user2.id, scope: 'personal', name: 'Conta Profissional', bank: 'Banco Verde', type: 'checking', balance: 23000, logoUrl: bankLogos[1] }
  });
  const accNutri2 = await prisma.account.create({
    data: { id: 'acc-nutri-2', ownerId: user2.id, scope: 'personal', visibleIn: 'vault-family', name: 'Poupança Pessoal', bank: 'PoupaBanco', type: 'savings', balance: 42000, logoUrl: bankLogos[6] }
  });
  const accFamily = await prisma.account.create({
    data: { id: 'acc-family', ownerId: user1.id, scope: 'vault', vaultId: vaultFamily.id, name: 'Conta Conjunta da Família', bank: 'Banco Familiar', type: 'checking', balance: 5200, logoUrl: bankLogos[4] }
  });
  const accAgency1 = await prisma.account.create({
    data: { id: 'acc-agency-1', ownerId: user1.id, scope: 'vault', vaultId: vaultAgency.id, name: 'Conta PJ Agência', bank: 'Banco Empresarial', type: 'checking', balance: 25000, logoUrl: bankLogos[5] }
  });
  const accTripChecking = await prisma.account.create({
    data: { id: 'acc-trip-checking', ownerId: user1.id, scope: 'vault', vaultId: vaultTrip.id, name: 'Conta Corrente Japão', bank: 'Banco Global', type: 'checking', balance: 2000, logoUrl: bankLogos[3] }
  });
  const accTripCard = await prisma.account.create({
    data: { id: 'acc-trip-card', ownerId: user1.id, scope: 'vault', vaultId: vaultTrip.id, name: 'Cartão para Viagem', bank: 'Banco Global', type: 'credit_card', balance: 0, creditLimit: 20000, logoUrl: bankLogos[3] }
  });

  console.log(`✅ 9 contas criadas`);

  // ============================================
  // 4. CRIAR GOALS (CAIXINHAS)
  // ============================================
  console.log('🎯 Criando metas...');

  const goalDev1 = await prisma.goal.create({
    data: { id: 'goal-dev-1', ownerId: user1.id, ownerType: 'user', name: 'Setup Novo', targetAmount: 15000, currentAmount: 7500, emoji: '🖥️', visibility: 'private', isFeatured: true, participants: { create: [{ userId: user1.id, role: 'owner' }] } }
  });
  const goalAnna1 = await prisma.goal.create({
    data: { id: 'goal-anna-1', ownerId: user2.id, ownerType: 'user', name: 'Viagem com Amigos', targetAmount: 5000, currentAmount: 1200, emoji: '🏖️', visibility: 'shared', isFeatured: true, participants: { create: [{ userId: user2.id, role: 'owner' }, { userId: user3.id, role: 'member' }, { userId: user4.id, role: 'member' }] } }
  });
  const goalFamily1 = await prisma.goal.create({
    data: { id: 'goal-family-1', ownerId: vaultFamily.id, ownerType: 'vault', name: 'Reforma da Cozinha', targetAmount: 35000, currentAmount: 8000, emoji: '🛠️', visibility: 'shared', isFeatured: true, participants: { create: [{ userId: user1.id, role: 'owner' }, { userId: user2.id, role: 'member' }] } }
  });
  const goalFamily2 = await prisma.goal.create({
    data: { id: 'goal-family-2', ownerId: vaultFamily.id, ownerType: 'vault', name: 'Fundo de Emergência', targetAmount: 50000, currentAmount: 32000, emoji: '🛡️', visibility: 'shared', participants: { create: [{ userId: user1.id, role: 'owner' }, { userId: user2.id, role: 'member' }] } }
  });
  const goalAgency1 = await prisma.goal.create({
    data: { id: 'goal-agency-1', ownerId: vaultAgency.id, ownerType: 'vault', name: 'Macbook M4 Pro', targetAmount: 25000, currentAmount: 18000, emoji: '💻', visibility: 'shared', participants: { create: [{ userId: user1.id, role: 'owner' }] } }
  });
  const goalOffice1 = await prisma.goal.create({
    data: { id: 'goal-office-1', ownerId: vaultOffice.id, ownerType: 'vault', name: 'Bioimpedância Nova', targetAmount: 40000, currentAmount: 11000, emoji: '🔬', visibility: 'shared', participants: { create: [{ userId: user2.id, role: 'owner' }] } }
  });

  console.log('✅ 6 metas principais criadas');

  // ============================================
  // 5. CRIAR TRANSAÇÕES
  // ============================================
  console.log('💸 Criando transações...');

  await Promise.all([
    // Transações do User 1 (Dev)
    prisma.transaction.create({ data: { date: new Date('2024-07-28'), description: 'Salário Mensal', amount: 12000, type: 'income', category: 'Salário', destinationAccountId: accDev1.id, actorId: user1.id, userId: user1.id, isRecurring: true } }),
    prisma.transaction.create({ data: { date: new Date('2024-07-25'), description: 'Almoço com cliente (Crédito)', amount: 80, type: 'expense', category: 'Alimentação', sourceAccountId: accDev3.id, paymentMethod: 'credit_card', actorId: user1.id, userId: user1.id } }),
    prisma.transaction.create({ data: { date: new Date('2024-07-26'), description: 'Café (Débito)', amount: 15, type: 'expense', category: 'Alimentação', sourceAccountId: accDev1.id, paymentMethod: 'debit_card', actorId: user1.id, userId: user1.id } }),
    prisma.transaction.create({ data: { date: new Date('2024-07-27'), description: 'Estacionamento (Pix)', amount: 20, type: 'expense', category: 'Transporte', sourceAccountId: accDev1.id, paymentMethod: 'pix', actorId: user1.id, userId: user1.id } }),
    prisma.transaction.create({ data: { date: new Date('2024-07-28'), description: 'Conta de luz (Boleto)', amount: 150, type: 'expense', category: 'Casa', sourceAccountId: accDev1.id, paymentMethod: 'boleto', actorId: user1.id, userId: user1.id, isRecurring: true } }),
    prisma.transaction.create({ data: { date: new Date('2024-07-29'), description: 'Feira (Dinheiro)', amount: 50, type: 'expense', category: 'Alimentação', sourceAccountId: accDev1.id, paymentMethod: 'cash', actorId: user1.id, userId: user1.id } }),
    prisma.transaction.create({ data: { date: new Date('2024-07-18'), description: 'Movimentação para Investimentos', amount: 2000, type: 'transfer', category: 'Investimento', sourceAccountId: accDev1.id, destinationAccountId: accDev2.id, actorId: user1.id, userId: user1.id } }),
    
    // Transação para uma caixinha (corrigido)
    prisma.transaction.create({ data: { date: new Date('2024-07-20'), description: 'Economia para Setup', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: accDev1.id, goalId: goalDev1.id, actorId: user1.id, userId: user1.id } }),
    
    // Retirada de uma caixinha (corrigido)
    prisma.transaction.create({ data: { date: new Date('2024-06-01'), description: 'Resgate para emergência', amount: 500, type: 'transfer', category: 'Caixinha', destinationAccountId: accDev1.id, goalId: goalDev1.id, actorId: user1.id, userId: user1.id } }),
    
    // Transações de parcela (corrigido e simplificado)
    prisma.transaction.create({ data: { date: new Date('2024-07-10'), description: 'Compra de Monitor Novo', amount: 800, type: 'expense', category: 'Trabalho', sourceAccountId: accDev3.id, paymentMethod: 'credit_card', actorId: user1.id, userId: user1.id, isInstallment: true, installmentNumber: 1, totalInstallments: 3 } }),
    prisma.transaction.create({ data: { date: new Date('2024-08-10'), description: 'Compra de Monitor Novo', amount: 800, type: 'expense', category: 'Trabalho', sourceAccountId: accDev3.id, paymentMethod: 'credit_card', actorId: user1.id, userId: user1.id, isInstallment: true, installmentNumber: 2, totalInstallments: 3 } }),

    // Transações no cofre da família
    prisma.transaction.create({ data: { date: new Date('2024-07-27'), description: 'Supermercado do Mês', amount: 1800, type: 'expense', category: 'Alimentação', sourceAccountId: accFamily.id, paymentMethod: 'credit_card', actorId: user2.id, vaultId: vaultFamily.id } }),
    prisma.transaction.create({ data: { date: new Date('2024-07-26'), description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: accFamily.id, paymentMethod: 'boleto', actorId: user1.id, vaultId: vaultFamily.id, isRecurring: true } }),
    
    // Contribuições para o cofre (corrigido)
    prisma.transaction.create({ data: { date: new Date('2024-07-15'), description: 'Contribuição do Dev', amount: 1500, type: 'transfer', category: 'Contribuição Familiar', sourceAccountId: accDev1.id, destinationAccountId: accFamily.id, actorId: user1.id, vaultId: vaultFamily.id, isRecurring: true } }),
    prisma.transaction.create({ data: { date: new Date('2024-07-16'), description: 'Contribuição da Anna', amount: 1500, type: 'transfer', category: 'Contribuição Familiar', sourceAccountId: accNutri1.id, destinationAccountId: accFamily.id, actorId: user2.id, vaultId: vaultFamily.id, isRecurring: true } }),
  ]);

  console.log(`✅ Transações de teste criadas`);

  // ============================================
  // 6. CRIAR NOTIFICAÇÕES
  // ============================================
  console.log('🔔 Criando notificações...');

  await Promise.all([
    prisma.notification.create({ data: { userId: user1.id, type: 'goal_invite', text: '<b>Daniela</b> te convidou para a caixinha "Viagem de Fim de Ano".', actorId: user4.id, actorName: 'Daniela', actorAvatar: user4.avatarUrl, link: '/invitations' } }),
    prisma.notification.create({ data: { userId: user1.id, type: 'transaction_added', text: '<b>Anna</b> adicionou uma nova despesa de <b>R$ 1.800,00</b> em "Família DevAnna".', actorId: user2.id, actorName: 'Anna', actorAvatar: user2.avatarUrl, relatedId: 't-fam-1', link: '/transactions' } }),
    prisma.notification.create({ data: { userId: user1.id, type: 'goal_progress', text: 'Parabéns! Vocês alcançaram <b>90%</b> da meta "Fundo de Emergência".', link: '/goals/goal-family-2', read: true } }),
  ]);

  console.log(`✅ 3 notificações criadas`);

  // ============================================
  // 7. CRIAR CONVITES
  // ============================================
  console.log('📨 Criando convites...');

  await Promise.all([
    prisma.invitation.create({ data: { type: 'goal', targetId: 'goal-anna-1', targetName: 'Viagem com Amigos', senderId: user2.id, receiverId: user5.id, status: 'pending' } }),
  ]);

  console.log(`✅ 1 convite criado`);

  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
