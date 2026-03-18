import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100', // Woman portrait
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100', // Man portrait
  'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=100', // Woman smiling
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=100', // Man glasses
];

const VAULT_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', // Home interior
  'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800', // Travel
  'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800', // Savings jar
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', // Apartment
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', // House
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800', // Modern building
];

const BANK_LOGOS = {
  inter: '/images/banks/inter.png',
  btg: '/images/banks/btg.png',
  nubank: '/images/banks/nubank.png',
  itau: '/images/banks/itau.png',
  santander: '/images/banks/santander.png',
  bradesco: '/images/banks/bradesco.png',
  bb: '/images/banks/banco-do-brasil.png',
  caixa: '/images/banks/caixa.png',
  c6: '/images/banks/c6bank.png',
};

// Helper para datas relativas
const now = new Date();
const getDaysAgo = (days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date;
};

const getMonthsAgo = (months: number) => {
  const date = new Date(now);
  date.setMonth(date.getMonth() - months);
  return date;
};

async function main() {
  console.log('🚀 Iniciando o seeding do banco de dados...');

  // Limpeza de dados existentes
  console.log('🧹 Limpando dados existentes...');
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.goalParticipant.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.vaultMember.deleteMany();
  await prisma.vault.deleteMany();
  await prisma.savedReport.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Criar Usuários
  console.log('👤 Criando usuários demo...');
  const user1 = await prisma.user.create({
    data: {
      name: 'Clara Designer',
      email: 'clara@caixinhas.app',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[0],
      subscriptionStatus: 'active',
      trialExpiresAt: faker.date.future({ years: 1 }),
      workspaceImageUrl: '/screenshots/workspace-selection.png',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'João Desenvolvedor',
      email: 'joao@caixinhas.app',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[1],
      subscriptionStatus: 'active',
      trialExpiresAt: faker.date.future({ years: 1 }),
      workspaceImageUrl: '/screenshots/personal-dashboard.png',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Ana Analista',
      email: 'ana@caixinhas.app',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[2],
      subscriptionStatus: 'trial',
      trialExpiresAt: getDaysAgo(-15), // vence em 15 dias
      workspaceImageUrl: '/screenshots/all-boxes-view.png',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Marcos Gestor',
      email: 'marcos@caixinhas.app',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[3],
      subscriptionStatus: 'inactive',
      trialExpiresAt: getDaysAgo(30), // venceu ha 30 dias
      workspaceImageUrl: '/screenshots/main-dashboard.png',
    },
  });

  // 2. Cofres
  console.log('📦 Criando cofres...');
  const sharedVault = await prisma.vault.create({
    data: {
      name: 'Família Tech',
      imageUrl: VAULT_IMAGE_URLS[0],
      isPrivate: false,
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: 'owner' },
          { userId: user2.id, role: 'member' },
          { userId: user3.id, role: 'member' },
        ],
      },
    },
  });

  const vaults = [
    { name: 'Pessoal Clara', owner: user1, img: VAULT_IMAGE_URLS[1] },
    { name: 'Pessoal João', owner: user2, img: VAULT_IMAGE_URLS[2] },
    { name: 'Investimentos Marcos', owner: user4, img: VAULT_IMAGE_URLS[5] },
  ];

  const createdVaults = await Promise.all(
    vaults.map(v => prisma.vault.create({
      data: {
        name: v.name,
        imageUrl: v.img,
        isPrivate: true,
        ownerId: v.owner.id,
        members: { create: { userId: v.owner.id, role: 'owner' } },
      }
    }))
  );

  const claraVault = createdVaults[0];
  const joaoVault = createdVaults[1];

  // 3. Categorias
  console.log('🏷️ Criando categorias básicas...');
  const baseCategories = ['Salário', 'Freelance', 'Alimentação', 'Transporte', 'Lazer', 'Assinaturas', 'Educação', 'Saúde', 'Investimentos'];
  
  for (const user of [user1, user2, user3, user4]) {
    await prisma.category.createMany({
      data: baseCategories.map(name => ({ name, ownerId: user.id })),
      skipDuplicates: true
    });
  }

  const allCategories = await prisma.category.findMany();
  const getCat = (userId: string, name: string) => allCategories.find(c => c.ownerId === userId && c.name === name)!;

  // 4. Contas
  console.log('💰 Criando contas bancárias...');
  const claraAccount = await prisma.account.create({
    data: {
      name: 'Inter Principal',
      bank: 'Banco Inter',
      type: 'corrente',
      balance: 4500.50,
      logoUrl: BANK_LOGOS.inter,
      scope: claraVault.id,
      ownerId: user1.id,
      vaultId: claraVault.id,
    },
  });

  const joaoAccount = await prisma.account.create({
    data: {
      name: 'Nubank João',
      bank: 'Nubank',
      type: 'corrente',
      balance: 1200.00,
      logoUrl: BANK_LOGOS.nubank,
      scope: joaoVault.id,
      ownerId: user2.id,
      vaultId: joaoVault.id,
    },
  });

  const joaoCredit = await prisma.account.create({
    data: {
      name: 'Mastercard Black',
      bank: 'Santander',
      type: 'credito',
      balance: -2850.40,
      creditLimit: 15000,
      logoUrl: BANK_LOGOS.santander,
      scope: joaoVault.id,
      ownerId: user2.id,
      vaultId: joaoVault.id,
    },
  });

  const sharedAccount = await prisma.account.create({
    data: {
      name: 'Conta Conjunta',
      bank: 'Itaú',
      type: 'corrente',
      balance: 8900.00,
      logoUrl: BANK_LOGOS.itau,
      scope: sharedVault.id,
      ownerId: user1.id,
      vaultId: sharedVault.id,
    },
  });

  // 5. Metas (Goals/Caixinhas)
  console.log('🎯 Criando metas (caixinhas)...');
  const travelGoal = await prisma.goal.create({
    data: {
      name: 'Viagem Japão 2026',
      targetAmount: 30000,
      currentAmount: 4500,
      emoji: '🇯🇵',
      visibility: 'shared',
      vaultId: sharedVault.id,
      participants: {
        create: [
          { userId: user1.id, role: 'owner' },
          { userId: user2.id, role: 'member' },
        ]
      }
    }
  });

  const reserveGoal = await prisma.goal.create({
    data: {
      name: 'Reserva de Emergência',
      targetAmount: 20000,
      currentAmount: 12000,
      emoji: '🛡️',
      visibility: 'private',
      userId: user1.id,
      vaultId: claraVault.id,
      participants: { create: { userId: user1.id, role: 'owner' } }
    }
  });

  // 6. Transações Dinâmicas (Últimos 3 meses)
  console.log('💸 Gerando transações (Recorrentes, Parceladas, etc)...');

  // a. Salário Recorrente (Clara e João)
  const salaryIdClara = faker.string.uuid();
  const salaryIdJoao = faker.string.uuid();

  for (let i = 0; i < 3; i++) {
    const monthDate = getMonthsAgo(i);
    monthDate.setDate(5); // Dia 5

    await prisma.transaction.create({
      data: {
        amount: 8500,
        date: monthDate,
        description: 'Salário Mensal - Design Inc',
        type: 'income',
        isRecurring: true,
        recurringId: salaryIdClara,
        actorId: user1.id,
        userId: user1.id,
        sourceAccountId: claraAccount.id,
        categoryId: getCat(user1.id, 'Salário').id,
        vaultId: claraVault.id,
      }
    });

    await prisma.transaction.create({
      data: {
        amount: 7200,
        date: monthDate,
        description: 'Salário Mensal - Dev Solutions',
        type: 'income',
        isRecurring: true,
        recurringId: salaryIdJoao,
        actorId: user2.id,
        userId: user2.id,
        sourceAccountId: joaoAccount.id,
        categoryId: getCat(user2.id, 'Salário').id,
        vaultId: joaoVault.id,
      }
    });
  }

  // b. Entradas Parceladas (Freelance da Clara)
  console.log('   - Adicionando entrada parcelada (Freelance 3x)...');
  const freelanceId = faker.string.uuid();
  for (let i = 1; i <= 3; i++) {
    const date = getMonthsAgo(3 - i);
    date.setDate(15);

    await prisma.transaction.create({
      data: {
        amount: 2000,
        date: date,
        description: `Projeto UI/UX BrandX (${i}/3)`,
        type: 'income',
        isInstallment: true,
        installmentNumber: i,
        totalInstallments: 3,
        recurringId: freelanceId,
        actorId: user1.id,
        userId: user1.id,
        sourceAccountId: claraAccount.id,
        categoryId: getCat(user1.id, 'Freelance').id,
        vaultId: claraVault.id,
      }
    });
  }

  // c. Despesas Parceladas (iPhone João no Crédito)
  console.log('   - Adicionando despesa parcelada (iPhone 6x)...');
  const iPhoneId = faker.string.uuid();
  for (let i = 1; i <= 6; i++) {
    const date = getMonthsAgo(4 - i); // Começou ha um mês
    date.setDate(10);

    await prisma.transaction.create({
      data: {
        amount: -850.50,
        date: date,
        description: `iPhone 15 Pro Max (${i}/6)`,
        type: 'expense',
        paymentMethod: 'credit_card',
        isInstallment: true,
        installmentNumber: i,
        totalInstallments: 6,
        recurringId: iPhoneId,
        actorId: user2.id,
        userId: user2.id,
        sourceAccountId: joaoCredit.id,
        categoryId: getCat(user2.id, 'Lazer').id,
        vaultId: joaoVault.id,
        paidInstallments: i <= 2 ? [i] : [], // Primeiras 2 pagas
      }
    });
  }

  // d. Assinaturas Recorrentes
  console.log('   - Adicionando assinaturas (Netflix, Spotify)...');
  const subs = [
    { desc: 'Netflix 4K', amount: -55.90, cat: 'Assinaturas', day: 12 },
    { desc: 'Spotify Family', amount: -34.90, cat: 'Assinaturas', day: 20 },
    { desc: 'Academia BlueFit', amount: -119.90, cat: 'Saúde', day: 1 },
  ];

  for (const sub of subs) {
    const recId = faker.string.uuid();
    for (let i = 0; i < 3; i++) {
      const date = getMonthsAgo(i);
      date.setDate(sub.day);
      
      await prisma.transaction.create({
        data: {
          amount: sub.amount,
          date: date,
          description: sub.desc,
          type: 'expense',
          isRecurring: true,
          recurringId: recId,
          actorId: user1.id,
          userId: user1.id,
          sourceAccountId: claraAccount.id,
          categoryId: getCat(user1.id, sub.cat).id,
          vaultId: claraVault.id,
        }
      });
    }
  }

  // e. Transações Aleatórias Recentemente
  console.log('   - Adicionando transações diversas...');
  const randomExpenses = [
    { desc: 'iFood - Burger King', amount: -85.00, cat: 'Alimentação' },
    { desc: 'Posto Shell', amount: -150.00, cat: 'Transporte' },
    { desc: 'Farmácia Pague Menos', amount: -42.30, cat: 'Saúde' },
    { desc: 'Supermercado Pão de Açúcar', amount: -430.20, cat: 'Alimentação' },
    { desc: 'Cinema Kinoplex', amount: -65.00, cat: 'Lazer' },
  ];

  for (let i = 0; i < 20; i++) {
    const expense = faker.helpers.arrayElement(randomExpenses);
    const date = faker.date.recent({ days: 60 });

    await prisma.transaction.create({
      data: {
        amount: expense.amount,
        date: date,
        description: expense.desc,
        type: 'expense',
        actorId: user1.id,
        userId: user1.id,
        sourceAccountId: claraAccount.id,
        categoryId: getCat(user1.id, expense.cat).id,
        vaultId: claraVault.id,
      }
    });
  }

  // 7. Convites e Notificações
  console.log('✉️ Criando notificações e convites...');
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'system',
      message: 'Sua reserva de emergência atingiu 60% da meta!',
      isRead: false,
    }
  });

  await prisma.invitation.create({
    data: {
      type: 'vault',
      targetId: sharedVault.id,
      targetName: sharedVault.name,
      senderId: user1.id,
      receiverEmail: 'convidado@teste.com',
      status: 'pending',
    }
  });

  console.log('✨ Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
