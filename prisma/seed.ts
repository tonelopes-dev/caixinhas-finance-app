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
  console.log('🚀 Iniciando o seeding do banco de dados com dados reais...');

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

  // 1. Criar Usuários reais
  console.log('👤 Criando usuários Clara Beatriz, João Pedro e Ana Luiza...');
  const clara = await prisma.user.create({
    data: {
      name: 'Clara Beatriz',
      email: 'clara.beatriz@caixinhas.app',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[0],
      subscriptionStatus: 'active',
      trialExpiresAt: faker.date.future({ years: 1 }),
      workspaceImageUrl: VAULT_IMAGE_URLS[1],
    },
  });

  const joao = await prisma.user.create({
    data: {
      name: 'João Pedro',
      email: 'joao.pedro@caixinhas.app',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[1],
      subscriptionStatus: 'active',
      trialExpiresAt: faker.date.future({ years: 1 }),
      workspaceImageUrl: VAULT_IMAGE_URLS[2],
    },
  });

  const ana = await prisma.user.create({
    data: {
      name: 'Ana Luiza',
      email: 'ana.luiza@caixinhas.app',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[2],
      subscriptionStatus: 'trial',
      trialExpiresAt: getDaysAgo(-15),
      workspaceImageUrl: VAULT_IMAGE_URLS[3],
    },
  });

  // 2. Cofres
  console.log('📦 Criando cofres compartilhados e pessoais...');
  const sharedVault = await prisma.vault.create({
    data: {
      name: 'Casal & Sonhos',
      imageUrl: VAULT_IMAGE_URLS[0],
      isPrivate: false,
      ownerId: clara.id,
      members: {
        create: [
          { userId: clara.id, role: 'owner' },
          { userId: joao.id, role: 'member' },
          { userId: ana.id, role: 'member' },
        ],
      },
    },
  });

  const personalVaults = await Promise.all([
    prisma.vault.create({
      data: {
        name: 'Cofre da Clara',
        isPrivate: true,
        ownerId: clara.id,
        members: { create: { userId: clara.id, role: 'owner' } },
      }
    }),
    prisma.vault.create({
      data: {
        name: 'Cofre do João',
        isPrivate: true,
        ownerId: joao.id,
        members: { create: { userId: joao.id, role: 'owner' } },
      }
    })
  ]);

  const claraVault = personalVaults[0];
  const joaoVault = personalVaults[1];

  // 3. Categorias
  console.log('🏷️ Criando categorias para cada usuário...');
  const categoriesList = ['Salário', 'Freelance', 'Alimentação', 'Transporte', 'Lazer', 'Assinaturas', 'Educação', 'Saúde', 'Investimentos', 'Viagem'];
  
  for (const user of [clara, joao, ana]) {
    await prisma.category.createMany({
      data: categoriesList.map(name => ({ name, ownerId: user.id })),
      skipDuplicates: true
    });
  }

  const allCategories = await prisma.category.findMany();
  const getCat = (userId: string, name: string) => allCategories.find(c => c.ownerId === userId && c.name === name)!;

  // 4. Contas Bancárias Reais
  console.log('💰 Criando contas bancárias...');
  const claraInter = await prisma.account.create({
    data: {
      name: 'Inter Beatriz',
      bank: 'Banco Inter',
      type: 'corrente',
      balance: 15400.00,
      logoUrl: BANK_LOGOS.inter,
      scope: claraVault.id,
      ownerId: clara.id,
      vaultId: claraVault.id,
    },
  });

  const claraNubank = await prisma.account.create({
    data: {
      name: 'Nubank Clara',
      bank: 'Nubank',
      type: 'corrente',
      balance: 2150.80,
      logoUrl: BANK_LOGOS.nubank,
      scope: claraVault.id,
      ownerId: clara.id,
      vaultId: claraVault.id,
    },
  });

  const joaoBTG = await prisma.account.create({
    data: {
      name: 'BTG Pedro',
      bank: 'BTG Pactual',
      type: 'corrente',
      balance: 12400.00,
      logoUrl: BANK_LOGOS.btg,
      scope: joaoVault.id,
      ownerId: joao.id,
      vaultId: joaoVault.id,
    },
  });

  const joaoSantander = await prisma.account.create({
    data: {
      name: 'Santander Black',
      bank: 'Santander',
      type: 'credito',
      balance: -4200.00,
      creditLimit: 25000,
      logoUrl: BANK_LOGOS.santander,
      scope: joaoVault.id,
      ownerId: joao.id,
      vaultId: joaoVault.id,
    },
  });

  const anaItau = await prisma.account.create({
    data: {
      name: 'Itaú Luiza',
      bank: 'Itaú',
      type: 'corrente',
      balance: 5600.00,
      logoUrl: BANK_LOGOS.itau,
      scope: 'personal', // Luiza prefere manter fora de cofres por enquanto
      ownerId: ana.id,
    },
  });

  // 5. Metas (Caixinhas) Reais
  console.log('🎯 Criando caixinhas reais...');
  const travelGoal = await prisma.goal.create({
    data: {
      name: 'Viagem Japão 2026',
      targetAmount: 35000,
      currentAmount: 0, // Será atualizado pelas transações
      emoji: '🇯🇵',
      visibility: 'shared',
      vaultId: sharedVault.id,
      participants: {
        create: [
          { userId: clara.id, role: 'owner' },
          { userId: joao.id, role: 'member' },
          { userId: ana.id, role: 'member' },
        ]
      }
    }
  });

  const houseGoal = await prisma.goal.create({
    data: {
      name: 'Reforma do Apartamento',
      targetAmount: 50000,
      currentAmount: 0,
      emoji: '🏠',
      visibility: 'shared',
      vaultId: sharedVault.id,
      participants: {
        create: [
          { userId: clara.id, role: 'owner' },
          { userId: joao.id, role: 'member' },
        ]
      }
    }
  });

  const reserveGoal = await prisma.goal.create({
    data: {
      name: 'Reserva de Emergência',
      description: 'Reserva para cobrir imprevistos e garantir tranquilidade financeira para o casal.',
      targetAmount: 25000,
      currentAmount: 0,
      emoji: '🛡️',
      visibility: 'shared',
      vaultId: sharedVault.id,
      participants: {
        create: [
          { userId: clara.id, role: 'owner' },
          { userId: joao.id, role: 'member' },
        ]
      }
    }
  });

  // 6. Transações e Colaborações
  console.log('💸 Gerando histórico de transações e colaborações...');

  // Adicionar salários e rendas primeiro para ter saldo
  for (let i = 0; i < 6; i++) {
    const date = getMonthsAgo(i);
    date.setDate(5);

    // Clara
    await prisma.transaction.create({
      data: {
        amount: 9500,
        date: date,
        description: 'Salário Clara - Design Studio',
        type: 'income',
        actorId: clara.id,
        userId: clara.id,
        sourceAccountId: claraInter.id,
        categoryId: getCat(clara.id, 'Salário').id,
        vaultId: claraVault.id,
      }
    });

    // João
    await prisma.transaction.create({
      data: {
        amount: 11200,
        date: date,
        description: 'Salário João - Senior Dev',
        type: 'income',
        actorId: joao.id,
        userId: joao.id,
        sourceAccountId: joaoBTG.id,
        categoryId: getCat(joao.id, 'Salário').id,
        vaultId: joaoVault.id,
      }
    });
  }

  // Colaborações na Caixinha do Japão (Todos os meses, todos participam)
  console.log('   - Registrando depósitos mensais na caixinha do Japão...');
  let totalJapan = 0;
  for (let i = 0; i < 6; i++) {
    const date = getMonthsAgo(i);
    date.setDate(10);

    // Depósito da Clara
    const amtClara = 1200 + faker.number.int({ min: 100, max: 500 });
    await prisma.transaction.create({
      data: {
        amount: amtClara,
        date: date,
        description: `Contribuição Clara - Mês ${6-i}`,
        type: 'income',
        actorId: clara.id,
        userId: clara.id,
        goalId: travelGoal.id,
        sourceAccountId: claraInter.id,
        vaultId: sharedVault.id,
        categoryId: getCat(clara.id, 'Investimentos').id,
      }
    });
    totalJapan += amtClara;

    // Depósito do João
    const amtJoao = 1500 + faker.number.int({ min: 100, max: 800 });
    await prisma.transaction.create({
      data: {
        amount: amtJoao,
        date: date,
        description: `Contribuição João - Mês ${6-i}`,
        type: 'income',
        actorId: joao.id,
        userId: joao.id,
        goalId: travelGoal.id,
        sourceAccountId: joaoBTG.id,
        vaultId: sharedVault.id,
        categoryId: getCat(joao.id, 'Investimentos').id,
      }
    });
    totalJapan += amtJoao;

    // Depósito da Ana (menor frequencia)
    if (i % 2 === 0) {
      const amtAna = 500;
      await prisma.transaction.create({
        data: {
          amount: amtAna,
          date: date,
          description: `Ajuda da Ana para a viagem!`,
          type: 'income',
          actorId: ana.id,
          userId: ana.id,
          goalId: travelGoal.id,
          sourceAccountId: anaItau.id,
          vaultId: sharedVault.id,
          categoryId: getCat(ana.id, 'Viagem').id,
        }
      });
      totalJapan += amtAna;
    }
  }

  // Atualizar montante atual do Japão
  await prisma.goal.update({
    where: { id: travelGoal.id },
    data: { currentAmount: totalJapan }
  });

  // Colaborações na Reforma
  console.log('   - Registrando depósitos na caixinha da Reforma...');
  let totalHouse = 0;
  for (let i = 0; i < 3; i++) {
    const date = getMonthsAgo(i);
    date.setDate(15);

    const amt = 2500;
    await prisma.transaction.create({
      data: {
        amount: amt,
        date: date,
        description: `Reserva Reforma do AP - Mês ${3-i}`,
        type: 'income',
        actorId: clara.id,
        userId: clara.id,
        goalId: houseGoal.id,
        sourceAccountId: claraInter.id,
        vaultId: sharedVault.id,
        categoryId: getCat(clara.id, 'Investimentos').id,
      }
    });
    totalHouse += amt;
  }
  await prisma.goal.update({ where: { id: houseGoal.id }, data: { currentAmount: totalHouse } });

  // Reserva de Emergência
  console.log('   - Registrando depósitos na Reserva de Emergência...');
  let totalReserve = 8000; // Começa com um valor base
  await prisma.transaction.create({
    data: {
        amount: 5000,
        date: getMonthsAgo(6),
        description: 'Aporte Inicial Reserva',
        type: 'income',
        actorId: clara.id,
        userId: clara.id,
        goalId: reserveGoal.id,
        sourceAccountId: claraInter.id,
        vaultId: sharedVault.id,
        categoryId: getCat(clara.id, 'Investimentos').id,
    }
  });
  totalReserve += 5000;
  await prisma.goal.update({ where: { id: reserveGoal.id }, data: { currentAmount: totalReserve } });

  // 7. Transações Diversas para parecer real
  console.log('🛒 Adicionando gastos cotidianos para todos...');
  const storeNames = ['Mercado Central', 'Posto Shell', 'iFood Premium', 'Farmácia Drogasil', 'Uber Trip', 'Netflix', 'Spotify', 'Amazon.com.br'];
  
  for (const user of [clara, joao, ana]) {
    const accountId = user.id === clara.id ? claraNubank.id : (user.id === joao.id ? joaoBTG.id : anaItau.id);
    const vaultId = user.id === clara.id ? claraVault.id : (user.id === joao.id ? joaoVault.id : null);

    for (let i = 0; i < 15; i++) {
      const store = faker.helpers.arrayElement(storeNames);
      await prisma.transaction.create({
        data: {
          amount: -faker.number.float({ min: 15, max: 350, fractionDigits: 2 }),
          date: faker.date.recent({ days: 30 }),
          description: store,
          type: 'expense',
          actorId: user.id,
          userId: user.id,
          sourceAccountId: accountId,
          vaultId: vaultId,
          categoryId: getCat(user.id, 'Lazer').id, // Simplificado
        }
      });
    }
  }

  console.log('✨ Seeding concluído com sucesso!');
  console.log(`✅ Usuários: ${clara.name}, ${joao.name}, ${ana.name}`);
  console.log(`✅ Caixinhas: Japão (${totalJapan.toFixed(2)}), Reforma (${totalHouse.toFixed(2)}), Reserva (${totalReserve.toFixed(2)})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
