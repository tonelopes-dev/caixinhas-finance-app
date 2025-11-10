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

  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user1',
        name: 'Dev',
        email: 'email01@conta.com',
        avatarUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=1080',
        subscriptionStatus: 'active',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user2',
        name: 'Anna',
        email: 'email02@conta.com',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080',
        subscriptionStatus: 'active',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user3',
        name: 'Carlos',
        email: 'carlos@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080',
        subscriptionStatus: 'inactive',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user4',
        name: 'Daniela',
        email: 'daniela@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1080',
        subscriptionStatus: 'active',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user5',
        name: 'Eduardo',
        email: 'eduardo@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1080',
        subscriptionStatus: 'trial',
      },
    }),
  ]);

  console.log(`✅ ${users.length} usuários criados`);

  // ============================================
  // 2. CRIAR VAULTS (COFRES)
  // ============================================
  console.log('🏦 Criando cofres...');

  const vaultFamily = await prisma.vault.create({
    data: {
      id: 'vault-family',
      name: 'Família DevAnna',
      ownerId: 'user1',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080',
      members: {
        create: [
          { userId: 'user1', role: 'owner' },
          { userId: 'user2', role: 'member' },
        ],
      },
    },
  });

  const vaultAgency = await prisma.vault.create({
    data: {
      id: 'vault-agency',
      name: 'Agência de Software',
      ownerId: 'user1',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080',
      members: {
        create: [{ userId: 'user1', role: 'owner' }],
      },
    },
  });

  const vaultOffice = await prisma.vault.create({
    data: {
      id: 'vault-office',
      name: 'Consultório Anna',
      ownerId: 'user2',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1080',
      members: {
        create: [{ userId: 'user2', role: 'owner' }],
      },
    },
  });

  const vaultTrip = await prisma.vault.create({
    data: {
      id: 'vault-trip',
      name: 'Viagem para o Japão',
      ownerId: 'user1',
      imageUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1080',
      members: {
        create: [
          { userId: 'user1', role: 'owner' },
          { userId: 'user2', role: 'member' },
        ],
      },
    },
  });

  console.log('✅ 4 cofres criados');

  // ============================================
  // 3. CRIAR CONTAS
  // ============================================
  console.log('💳 Criando contas...');

  const accounts = await Promise.all([
    // Contas do Dev
    prisma.account.create({
      data: {
        id: 'acc-dev-1',
        ownerId: 'user1',
        scope: 'personal',
        visibleIn: ['vault-family'],
        name: 'Conta Corrente Pessoal',
        bank: 'Banco Digital',
        type: 'checking',
        balance: 12500,
        logoUrl: bankLogos[0],
      },
    }),
    prisma.account.create({
      data: {
        id: 'acc-dev-2',
        ownerId: 'user1',
        scope: 'personal',
        visibleIn: [],
        name: 'Investimentos Pessoais',
        bank: 'Corretora Ágil',
        type: 'investment',
        balance: 75000,
        logoUrl: bankLogos[2],
      },
    }),
    prisma.account.create({
      data: {
        id: 'acc-dev-3',
        ownerId: 'user1',
        scope: 'personal',
        visibleIn: [],
        name: 'Cartão Pessoal',
        bank: 'Banco Digital',
        type: 'credit_card',
        balance: 0,
        creditLimit: 15000,
        logoUrl: bankLogos[0],
      },
    }),

    // Contas da Anna
    prisma.account.create({
      data: {
        id: 'acc-nutri-1',
        ownerId: 'user2',
        scope: 'personal',
        visibleIn: [],
        name: 'Conta Profissional',
        bank: 'Banco Verde',
        type: 'checking',
        balance: 23000,
        logoUrl: bankLogos[1],
      },
    }),
    prisma.account.create({
      data: {
        id: 'acc-nutri-2',
        ownerId: 'user2',
        scope: 'personal',
        visibleIn: ['vault-family'],
        name: 'Poupança Pessoal',
        bank: 'PoupaBanco',
        type: 'savings',
        balance: 42000,
        logoUrl: bankLogos[6],
      },
    }),

    // Conta Conjunta da Família
    prisma.account.create({
      data: {
        id: 'acc-family',
        ownerId: 'user1',
        scope: 'vault-family',
        vaultId: 'vault-family',
        name: 'Conta Conjunta da Família',
        bank: 'Banco Familiar',
        type: 'checking',
        balance: 5200,
        logoUrl: bankLogos[4],
      },
    }),

    // Conta da Agência
    prisma.account.create({
      data: {
        id: 'acc-agency-1',
        ownerId: 'user1',
        scope: 'vault-agency',
        vaultId: 'vault-agency',
        name: 'Conta PJ Agência',
        bank: 'Banco Empresarial',
        type: 'checking',
        balance: 25000,
        logoUrl: bankLogos[5],
      },
    }),

    // Contas da Viagem
    prisma.account.create({
      data: {
        id: 'acc-trip-checking',
        ownerId: 'user1',
        scope: 'vault-trip',
        vaultId: 'vault-trip',
        name: 'Conta Corrente Japão',
        bank: 'Banco Global',
        type: 'checking',
        balance: 2000,
        logoUrl: bankLogos[3],
      },
    }),
    prisma.account.create({
      data: {
        id: 'acc-trip-savings',
        ownerId: 'user1',
        scope: 'vault-trip',
        vaultId: 'vault-trip',
        name: 'Poupança Viagem Japão',
        bank: 'Banco Global',
        type: 'savings',
        balance: 8000,
        logoUrl: bankLogos[3],
      },
    }),
  ]);

  console.log(`✅ ${accounts.length} contas criadas`);

  // ============================================
  // 4. CRIAR GOALS (CAIXINHAS)
  // ============================================
  console.log('🎯 Criando metas...');

  const goalDev1 = await prisma.goal.create({
    data: {
      id: 'goal-dev-1',
      ownerId: 'user1',
      userId: 'user1',
      ownerType: 'user',
      name: 'Setup Novo',
      targetAmount: 15000,
      currentAmount: 7500,
      emoji: '🖥️',
      visibility: 'private',
      isFeatured: true,
      participants: {
        create: [{ userId: 'user1', role: 'owner', contributionContextId: 'user1' }],
      },
    },
  });

  const goalAnna1 = await prisma.goal.create({
    data: {
      id: 'goal-anna-1',
      ownerId: 'user2',
      userId: 'user2',
      ownerType: 'user',
      name: 'Viagem com Amigos',
      targetAmount: 5000,
      currentAmount: 1200,
      emoji: '🏖️',
      visibility: 'shared',
      isFeatured: true,
      participants: {
        create: [
          { userId: 'user2', role: 'owner', contributionContextId: 'user2' },
          { userId: 'user3', role: 'member', contributionContextId: 'user3' },
          { userId: 'user4', role: 'member', contributionContextId: 'user4' },
        ],
      },
    },
  });

  const goalFamily1 = await prisma.goal.create({
    data: {
      id: 'goal-family-1',
      ownerId: 'vault-family',
      vaultId: 'vault-family',
      ownerType: 'vault',
      name: 'Reforma da Cozinha',
      targetAmount: 35000,
      currentAmount: 8000,
      emoji: '🛠️',
      visibility: 'shared',
      isFeatured: true,
      participants: {
        create: [
          { userId: 'user1', role: 'owner', contributionContextId: 'vault-family' },
          { userId: 'user2', role: 'member', contributionContextId: 'vault-family' },
        ],
      },
    },
  });

  const goalFamily2 = await prisma.goal.create({
    data: {
      id: 'goal-family-2',
      ownerId: 'vault-family',
      vaultId: 'vault-family',
      ownerType: 'vault',
      name: 'Fundo de Emergência',
      targetAmount: 50000,
      currentAmount: 32000,
      emoji: '🛡️',
      visibility: 'shared',
      participants: {
        create: [
          { userId: 'user1', role: 'owner', contributionContextId: 'vault-family' },
          { userId: 'user2', role: 'member', contributionContextId: 'vault-family' },
        ],
      },
    },
  });

  const goalAgency = await prisma.goal.create({
    data: {
      id: 'goal-agency-1',
      ownerId: 'vault-agency',
      vaultId: 'vault-agency',
      ownerType: 'vault',
      name: 'Macbook M4 Pro',
      targetAmount: 25000,
      currentAmount: 18000,
      emoji: '💻',
      visibility: 'shared',
      participants: {
        create: [{ userId: 'user1', role: 'owner', contributionContextId: 'vault-agency' }],
      },
    },
  });

  const goalOffice = await prisma.goal.create({
    data: {
      id: 'goal-office-1',
      ownerId: 'vault-office',
      vaultId: 'vault-office',
      ownerType: 'vault',
      name: 'Bioimpedância Nova',
      targetAmount: 40000,
      currentAmount: 11000,
      emoji: '🔬',
      visibility: 'shared',
      participants: {
        create: [{ userId: 'user2', role: 'owner', contributionContextId: 'vault-office' }],
      },
    },
  });

  console.log('✅ 6 metas principais criadas');

  // ============================================
  // 5. CRIAR TRANSAÇÕES
  // ============================================
  console.log('💸 Criando transações...');

  const transactions = await Promise.all([
    // Transações do Dev
    prisma.transaction.create({
      data: {
        id: 't-dev-1',
        ownerId: 'user1',
        ownerType: 'user',
        date: new Date('2024-07-28'),
        description: 'Salário',
        amount: 12000,
        type: 'income',
        category: 'Salário',
        destinationAccountId: 'acc-dev-1',
        actorId: 'user1',
        isRecurring: true,
      },
    }),
    prisma.transaction.create({
      data: {
        id: 't-dev-2',
        ownerId: 'user1',
        ownerType: 'user',
        date: new Date('2024-07-25'),
        description: 'Almoço com cliente',
        amount: 80,
        type: 'expense',
        category: 'Alimentação',
        sourceAccountId: 'acc-dev-3',
        paymentMethod: 'credit_card',
        actorId: 'user1',
      },
    }),
    prisma.transaction.create({
      data: {
        id: 't-dev-3',
        ownerId: 'user1',
        ownerType: 'user',
        date: new Date('2024-07-20'),
        description: 'Economia para Setup',
        amount: 1000,
        type: 'transfer',
        category: 'Caixinha',
        sourceAccountId: 'acc-dev-1',
        goalId: 'goal-dev-1',
        actorId: 'user1',
      },
    }),

    // Transações da Anna
    prisma.transaction.create({
      data: {
        id: 't-anna-1',
        ownerId: 'user2',
        ownerType: 'user',
        date: new Date('2024-07-29'),
        description: 'Recebimento de Consultas',
        amount: 7000,
        type: 'income',
        category: 'Renda Principal',
        destinationAccountId: 'acc-nutri-1',
        actorId: 'user2',
      },
    }),
    prisma.transaction.create({
      data: {
        id: 't-anna-2',
        ownerId: 'user2',
        ownerType: 'user',
        date: new Date('2024-07-26'),
        description: 'Jantar com amigos',
        amount: 120,
        type: 'expense',
        category: 'Lazer',
        sourceAccountId: 'acc-nutri-1',
        paymentMethod: 'credit_card',
        actorId: 'user2',
      },
    }),

    // Transações do Cofre Família
    prisma.transaction.create({
      data: {
        id: 't-fam-1',
        ownerId: 'vault-family',
        ownerType: 'vault',
        vaultId: 'vault-family',
        date: new Date('2024-07-27'),
        description: 'Supermercado do Mês',
        amount: 1800,
        type: 'expense',
        category: 'Alimentação',
        sourceAccountId: 'acc-family',
        paymentMethod: 'credit_card',
        actorId: 'user2',
      },
    }),
    prisma.transaction.create({
      data: {
        id: 't-fam-2',
        ownerId: 'vault-family',
        ownerType: 'vault',
        vaultId: 'vault-family',
        date: new Date('2024-07-26'),
        description: 'Pagamento Aluguel',
        amount: 2500,
        type: 'expense',
        category: 'Casa',
        sourceAccountId: 'acc-family',
        paymentMethod: 'boleto',
        actorId: 'user1',
      },
    }),
  ]);

  console.log(`✅ ${transactions.length} transações principais criadas`);

  // ============================================
  // 6. CRIAR NOTIFICAÇÕES
  // ============================================
  console.log('🔔 Criando notificações...');

  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        id: 'n1',
        userId: 'user1',
        type: 'goal_invite',
        text: '<b>Daniela</b> te convidou para a caixinha "Viagem de Fim de Ano".',
        actorId: 'user4',
        actorName: 'Daniela',
        actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1080',
        link: '/invitations',
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        id: 'n2',
        userId: 'user1',
        type: 'transaction_added',
        text: '<b>Anna</b> adicionou uma nova despesa de <b>R$ 1.800,00</b> em "Família DevAnna".',
        actorId: 'user2',
        actorName: 'Anna',
        actorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080',
        relatedId: 't-fam-1',
        link: '/transactions',
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        id: 'n3',
        userId: 'user1',
        type: 'goal_progress',
        text: 'Parabéns! Vocês alcançaram <b>90%</b> da meta "Fundo de Emergência".',
        link: '/goals/goal-family-2',
        read: true,
      },
    }),
  ]);

  console.log(`✅ ${notifications.length} notificações criadas`);

  // ============================================
  // 7. CRIAR CONVITES
  // ============================================
  console.log('📨 Criando convites...');

  const invitations = await Promise.all([
    prisma.invitation.create({
      data: {
        id: 'inv1',
        type: 'goal',
        targetId: 'goal-anna-1',
        targetName: 'Viagem com Amigos',
        senderId: 'user2',
        receiverId: 'user5',
        status: 'pending',
      },
    }),
  ]);

  console.log(`✅ ${invitations.length} convites criados`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`   - ${users.length} usuários`);
  console.log(`   - 4 cofres`);
  console.log(`   - ${accounts.length} contas`);
  console.log(`   - 6 metas`);
  console.log(`   - ${transactions.length} transações`);
  console.log(`   - ${notifications.length} notificações`);
  console.log(`   - ${invitations.length} convites`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
