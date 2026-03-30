import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const AVATAR_URLS = [
  "https://plus.unsplash.com/premium_photo-1668895511243-1696733f4fcb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Woman portrait
  "https://images.unsplash.com/photo-1549237511-6b64e006ce65?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Man portrait
  "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Woman smiling
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Man glasses
];

const VAULT_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", // Home interior
  "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800", // Travel
  "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800", // Savings jar
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", // Apartment
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", // House
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800", // Modern building
];

const BANK_LOGOS = {
  inter: "/images/banks/inter.png",
  btg: "/images/banks/btg.png",
  nubank: "/images/banks/nubank.png",
  itau: "/images/banks/itau.png",
  santander: "/images/banks/santander.png",
  bradesco: "/images/banks/bradesco.png",
  bb: "/images/banks/banco-do-brasil.png",
  caixa: "/images/banks/caixa.png",
  c6: "/images/banks/c6bank.png",
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
  console.log("🚀 Iniciando o seeding do banco de dados com dados reais...");

  // Limpeza de dados existentes
  console.log("🧹 Limpando dados existentes...");
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

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Criar Usuários reais
  console.log("👤 Criando usuários Clara Beatriz, João Pedro e Ana Luiza...");
  const clara = await prisma.user.create({
    data: {
      name: "Clara Beatriz",
      email: "clara.beatriz@caixinhas.app",
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[0],
      subscriptionStatus: "active",
      trialExpiresAt: faker.date.future({ years: 1 }),
      workspaceImageUrl: VAULT_IMAGE_URLS[1],
    },
  });

  const joao = await prisma.user.create({
    data: {
      name: "João Pedro",
      email: "joao.pedro@caixinhas.app",
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[1],
      subscriptionStatus: "active",
      trialExpiresAt: faker.date.future({ years: 1 }),
      workspaceImageUrl: VAULT_IMAGE_URLS[2],
    },
  });

  const ana = await prisma.user.create({
    data: {
      name: "Ana Luiza",
      email: "ana.luiza@caixinhas.app",
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[2],
      subscriptionStatus: "trial",
      trialExpiresAt: getDaysAgo(-15),
      workspaceImageUrl: VAULT_IMAGE_URLS[3],
    },
  });

  const beto = await prisma.user.create({
    data: {
      name: "Beto Gerente",
      email: "beto.gerente@caixinhas.app",
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[3],
      subscriptionStatus: "active",
      trialExpiresAt: faker.date.future({ years: 1 }),
      workspaceImageUrl: VAULT_IMAGE_URLS[4],
    },
  });

  // 2. Cofres
  console.log("📦 Criando cofres compartilhados e pessoais...");
  const sharedVault = await prisma.vault.create({
    data: {
      name: "Casal & Sonhos",
      imageUrl: VAULT_IMAGE_URLS[0],
      isPrivate: false,
      ownerId: clara.id,
      members: {
        create: [
          { userId: clara.id, role: "owner" },
          { userId: joao.id, role: "member" },
        ],
      },
    },
  });

  const companyVault = await prisma.vault.create({
    data: {
      name: "Clara Nutri - Empresa",
      imageUrl: VAULT_IMAGE_URLS[5],
      isPrivate: false,
      ownerId: clara.id,
      members: {
        create: [
          { userId: clara.id, role: "owner" },
          { userId: ana.id, role: "member" },
          { userId: beto.id, role: "member" },
          { userId: joao.id, role: "member" },
        ],
      },
    },
  });

  const personalVaults = await Promise.all([
    prisma.vault.create({
      data: {
        name: "Cofre da Clara",
        isPrivate: true,
        ownerId: clara.id,
        members: { create: { userId: clara.id, role: "owner" } },
      },
    }),
    prisma.vault.create({
      data: {
        name: "Cofre do João",
        isPrivate: true,
        ownerId: joao.id,
        members: { create: { userId: joao.id, role: "owner" } },
      },
    }),
  ]);

  const claraVault = personalVaults[0];
  const joaoVault = personalVaults[1];

  // 3. Categorias
  console.log("🏷️ Criando categorias para cada usuário...");
  const categoriesList = [
    "Salário",
    "Freelance",
    "Consulta Nutricional",
    "Alimentação",
    "Transporte",
    "Lazer",
    "Assinaturas",
    "Educação",
    "Saúde",
    "Investimentos",
    "Viagem",
    "Aluguel",
    "Moradia",
    "Marketing",
    "Equipamentos",
    "Aluguel Consultório",
    "Mercado",
    "Restaurante",
    "Café",
    "Uber",
    "Spotify",
    "Netflix",
  ];

  for (const user of [clara, joao, ana, beto]) {
    await prisma.category.createMany({
      data: categoriesList.map((name) => ({ name, ownerId: user.id })),
      skipDuplicates: true,
    });
  }

  const allCategories = await prisma.category.findMany();
  const getCat = (userId: string, name: string) =>
    allCategories.find((c) => c.ownerId === userId && c.name === name)!;

  // 4. Contas Bancárias Reais
  console.log("💰 Criando contas bancárias...");
  const claraInter = await prisma.account.create({
    data: {
      name: "Inter Beatriz",
      bank: "Banco Inter",
      type: "corrente",
      balance: 15400.0,
      logoUrl: BANK_LOGOS.inter,
      scope: "personal",
      ownerId: clara.id,
      vaultId: claraVault.id,
    },
  });

  const claraNubank = await prisma.account.create({
    data: {
      name: "Nubank Clara",
      bank: "Nubank",
      type: "checking",
      balance: 2150.8,
      logoUrl: BANK_LOGOS.nubank,
      scope: "personal",
      ownerId: clara.id,
      vaultId: claraVault.id,
    },
  });

  // @ts-expect-error - pendencia estrutural a ser revisada
  const claraBTG = await prisma.account.create({
    data: {
      name: "BTG Invest",
      bank: "BTG Pactual",
      type: "investment",
      balance: 45000.0,
      logoUrl: BANK_LOGOS.btg,
      scope: "personal",
      ownerId: clara.id,
      vaultId: claraVault.id,
    },
  });

  const claraItauCard = await prisma.account.create({
    data: {
      name: "Itaú Personalité",
      bank: "Itaú",
      type: "credit_card",
      balance: -12500.0,
      creditLimit: 60000.0,
      logoUrl: BANK_LOGOS.itau,
      scope: "personal",
      ownerId: clara.id,
      vaultId: claraVault.id,
    },
  });

  const claraBB = await prisma.account.create({
    data: {
      name: "BB Clara",
      bank: "Banco do Brasil",
      type: "corrente",
      balance: 1200.0,
      logoUrl: BANK_LOGOS.bb,
      scope: "personal",
      ownerId: clara.id,
      vaultId: claraVault.id,
    },
  });

  const claraSharedCaixa = await prisma.account.create({
    data: {
      name: "Caixa Casal",
      bank: "Caixa",
      type: "poupança",
      balance: 5000.0,
      logoUrl: BANK_LOGOS.caixa,
      scope: sharedVault.id,
      ownerId: clara.id,
      vaultId: sharedVault.id,
    },
  });

  const claraSharedBradesco = await prisma.account.create({
    data: {
      name: "Bradesco Prime",
      bank: "Bradesco",
      type: "credito",
      balance: -1500.0,
      creditLimit: 15000.0,
      logoUrl: BANK_LOGOS.bradesco,
      scope: sharedVault.id,
      ownerId: clara.id,
      vaultId: sharedVault.id,
    },
  });

  // @ts-expect-error - pendencia estrutural a ser revisada
  const claraSharedBTG = await prisma.account.create({
    data: {
      name: "Investimento Casal",
      bank: "BTG Pactual",
      type: "investment",
      balance: 30000.0,
      logoUrl: BANK_LOGOS.btg,
      scope: sharedVault.id,
      ownerId: clara.id,
      vaultId: sharedVault.id,
    },
  });

  const joaoSharedSantander = await prisma.account.create({
    data: {
      name: "Santander João",
      bank: "Santander",
      type: "corrente",
      balance: 8900.0,
      logoUrl: BANK_LOGOS.santander,
      scope: sharedVault.id,
      ownerId: joao.id,
      vaultId: sharedVault.id,
    },
  });

  const joaoBTG = await prisma.account.create({
    data: {
      name: "BTG Pedro",
      bank: "BTG Pactual",
      type: "corrente",
      balance: 12400.0,
      logoUrl: BANK_LOGOS.btg,
      scope: joaoVault.id,
      ownerId: joao.id,
      vaultId: joaoVault.id,
    },
  });

  // @ts-expect-error - pendencia estrutural a ser revisada
  const joaoSantander = await prisma.account.create({
    data: {
      name: "Santander Black",
      bank: "Santander",
      type: "credito",
      balance: -4200.0,
      creditLimit: 25000,
      logoUrl: BANK_LOGOS.santander,
      scope: joaoVault.id,
      ownerId: joao.id,
      vaultId: joaoVault.id,
    },
  });

  const companyInter = await prisma.account.create({
    data: {
      name: "Clara Nutri LJ",
      bank: "Banco Inter",
      type: "corrente",
      balance: 18500.0,
      logoUrl: BANK_LOGOS.inter,
      scope: companyVault.id,
      ownerId: clara.id,
      vaultId: companyVault.id,
    },
  });

  // @ts-expect-error - pendencia estrutural a ser revisada
  const anaItau = await prisma.account.create({
    data: {
      name: "Itaú Luiza",
      bank: "Itaú",
      type: "corrente",
      balance: 5600.0,
      logoUrl: BANK_LOGOS.itau,
      scope: "personal", // Luiza prefere manter fora de cofres por enquanto
      ownerId: ana.id,
    },
  });

  // 5. Metas (Caixinhas) Reais
  console.log("🎯 Criando caixinhas reais...");

  // --- Casal & Sonhos: Reforma, Reserva, Sofá Novo ---
  const houseGoal = await prisma.goal.create({
    data: {
      name: "Reforma do Apartamento",
      targetAmount: 50000,
      currentAmount: 0,
      emoji: "🏠",
      visibility: "shared",
      isFeatured: true,
      vaultId: sharedVault.id,
      participants: {
        create: [
          { userId: clara.id, role: "owner" },
          { userId: joao.id, role: "member" },
        ],
      },
    },
  });

  const reserveGoal = await prisma.goal.create({
    data: {
      name: "Reserva de Emergência",
      description:
        "Reserva para cobrir imprevistos e garantir tranquilidade financeira para o casal.",
      targetAmount: 25000,
      currentAmount: 0,
      emoji: "🛡️",
      visibility: "shared",
      isFeatured: true,
      vaultId: sharedVault.id,
      participants: {
        create: [
          { userId: clara.id, role: "owner" },
          { userId: joao.id, role: "member" },
        ],
      },
    },
  });

  const sofaGoal = await prisma.goal.create({
    data: {
      name: "Sofá Novo",
      targetAmount: 4500,
      currentAmount: 0,
      emoji: "🛋️",
      visibility: "shared",
      isFeatured: true,
      vaultId: sharedVault.id,
      participants: {
        create: [
          { userId: clara.id, role: "owner" },
          { userId: joao.id, role: "member" },
        ],
      },
    },
  });

  // --- Cofre da Clara (pessoal): iPhone ---
  const iphoneGoal = await prisma.goal.create({
    data: {
      name: "Comprar um iPhone",
      targetAmount: 8500,
      currentAmount: 0,
      emoji: "📱",
      visibility: "private",
      isFeatured: true,
      userId: clara.id,
      vaultId: claraVault.id,
      participants: {
        create: { userId: clara.id, role: "owner" },
      },
    },
  });

  // --- Clara Nutri - Empresa: Confra da Empresa, Viagem Japão ---
  const confraGoal = await prisma.goal.create({
    data: {
      name: "Confra da Empresa",
      description: "Confraternização de fim de ano da equipe Clara Nutri.",
      targetAmount: 5000,
      currentAmount: 0,
      emoji: "🎉",
      visibility: "shared",
      isFeatured: true,
      vaultId: companyVault.id,
      participants: {
        create: [
          { userId: clara.id, role: "owner" },
          { userId: ana.id, role: "member" },
          { userId: beto.id, role: "member" },
          { userId: joao.id, role: "member" },
        ],
      },
    },
  });

  const travelGoal = await prisma.goal.create({
    data: {
      name: "Viagem Japão 2026",
      targetAmount: 35000,
      currentAmount: 0,
      emoji: "🇯🇵",
      visibility: "shared",
      isFeatured: true,
      vaultId: companyVault.id,
      participants: {
        create: [
          { userId: clara.id, role: "owner" },
          { userId: joao.id, role: "member" },
          { userId: ana.id, role: "member" },
        ],
      },
    },
  });

  // 6. Transações e Colaborações
  console.log("💸 Gerando histórico de transações orgânicas...");

  // --- TRANSACÕES DA EMPRESA (CLARA NUTRI) ---
  console.log("   - Gerando transações da Empresa...");
  for (let i = 0; i < 6; i++) {
    const date = getMonthsAgo(i);
    
    // Receita de Consultas (Múltiplas por mês)
    for (let j = 0; j < 12; j++) {
      const day = faker.number.int({ min: 1, max: 28 });
      const d = new Date(date);
      d.setDate(day);
      
      await prisma.transaction.create({
        data: {
          amount: 250.0,
          date: d,
          description: `Consulta Nutricional - ${faker.person.fullName()}`,
          type: "income",
          actorId: clara.id,
          userId: clara.id,
          sourceAccountId: companyInter.id,
          categoryId: getCat(clara.id, "Consulta Nutricional").id,
          vaultId: companyVault.id,
          paymentMethod: faker.helpers.arrayElement(["PIX", "Cartão de Crédito", "Dinheiro"]),
        },
      });
    }

    // Despesas da Empresa
    const dClinic = new Date(date);
    dClinic.setDate(5);
    await prisma.transaction.create({
      data: {
        amount: -2500.0,
        date: dClinic,
        description: "Aluguel Consultório - Ed. Corporate",
        type: "expense",
        actorId: clara.id,
        userId: clara.id,
        sourceAccountId: companyInter.id,
        categoryId: getCat(clara.id, "Aluguel Consultório").id,
        vaultId: companyVault.id,
        paymentMethod: "Cartão de Crédito",
      },
    });

    dClinic.setDate(10);
    await prisma.transaction.create({
      data: {
        amount: -450.0,
        date: dClinic,
        description: "Marketing Digital - Google/Insta ads",
        type: "expense",
        actorId: clara.id,
        userId: clara.id,
        sourceAccountId: companyInter.id,
        categoryId: getCat(clara.id, "Marketing").id,
        vaultId: companyVault.id,
        paymentMethod: "Cartão de Crédito",
      },
    });
  }

  // --- TRANSACÕES PESSOAIS E COMPARTILHADAS ---
  for (let i = 0; i < 6; i++) {
    const date = getMonthsAgo(i);

    // Salário Clara (Pró-labore)
    const dSalary = new Date(date);
    dSalary.setDate(5);
    await prisma.transaction.create({
      data: {
        amount: 8500.0,
        date: dSalary,
        description: "Pró-labore Clara Beatriz",
        type: "income",
        actorId: clara.id,
        userId: clara.id,
        sourceAccountId: claraInter.id,
        categoryId: getCat(clara.id, "Salário").id,
        vaultId: claraVault.id,
        paymentMethod: "PIX",
      },
    });

    // Salário João
    await prisma.transaction.create({
      data: {
        amount: 11200.0,
        date: dSalary,
        description: "Salário João - Senior Dev",
        type: "income",
        actorId: joao.id,
        userId: joao.id,
        sourceAccountId: joaoBTG.id,
        categoryId: getCat(joao.id, "Salário").id,
        vaultId: joaoVault.id,
        paymentMethod: "PIX",
      },
    });

    // Depósitos nas Caixinhas (Casal)
    const dGoal = new Date(date);
    dGoal.setDate(10);
    
    // Japão
    await prisma.transaction.create({
      data: {
        amount: 1500,
        date: dGoal,
        description: "Aporte Viagem Japão",
        type: "income",
        actorId: clara.id,
        userId: clara.id,
        goalId: travelGoal.id,
        sourceAccountId: claraInter.id,
        vaultId: sharedVault.id,
        categoryId: getCat(clara.id, "Investimentos").id,
        paymentMethod: "PIX",
      },
    });

    // Reserva (Aporte mensal)
    await prisma.transaction.create({
      data: {
        amount: 800,
        date: dGoal,
        description: "Reserva Financeira Casal",
        type: "income",
        actorId: clara.id,
        userId: clara.id,
        goalId: reserveGoal.id,
        sourceAccountId: claraInter.id,
        vaultId: sharedVault.id,
        categoryId: getCat(clara.id, "Investimentos").id,
        paymentMethod: "PIX",
      },
    });

    // Reforma (Apenas Clara alguns meses)
    if (i % 2 === 0) {
      await prisma.transaction.create({
        data: {
          amount: 2500,
          date: dGoal,
          description: "Aporte Reforma AP",
          type: "income",
          actorId: clara.id,
          userId: clara.id,
          goalId: houseGoal.id,
          sourceAccountId: claraInter.id,
          vaultId: sharedVault.id,
          categoryId: getCat(clara.id, "Investimentos").id,
          paymentMethod: "PIX",
        },
      });
    }

    // Despesas de Casal (Supermercado, Lazer)
    for (let k = 0; k < 4; k++) {
      const dExp = new Date(date);
      dExp.setDate(faker.number.int({ min: 1, max: 28 }));
      await prisma.transaction.create({
        data: {
          amount: -faker.number.float({ min: 150, max: 800, fractionDigits: 2 }),
          date: dExp,
          description: faker.helpers.arrayElement(["Mercado Central", "Pão de Açúcar", "Zaffari", "Carrefour"]),
          type: "expense",
          actorId: faker.helpers.arrayElement([clara.id, joao.id]),
          userId: clara.id,
          sourceAccountId: faker.helpers.arrayElement([
            claraInter.id, 
            joaoBTG.id, 
            claraSharedCaixa.id, 
            claraSharedBradesco.id, 
            joaoSharedSantander.id
          ]),
          vaultId: sharedVault.id,
          categoryId: getCat(clara.id, "Mercado").id,
          paymentMethod: "Cartão de Crédito",
        },
      });
    }

    // Despesas Pessoais Clara (Lazer, Uber, Spotify)
    const dailyExpenses = [
      { desc: "Uber Trip", cat: "Uber", amt: [15, 60] },
      { desc: "Starbucks / Café", cat: "Café", amt: [12, 45] },
      { desc: "Restaurante", cat: "Restaurante", amt: [80, 250] },
    ];

    for (let m = 0; m < 8; m++) {
      const exp = faker.helpers.arrayElement(dailyExpenses);
      const dDaily = new Date(date);
      dDaily.setDate(faker.number.int({ min: 1, max: 28 }));
      await prisma.transaction.create({
        data: {
          amount: -faker.number.float({ min: exp.amt[0], max: exp.amt[1], fractionDigits: 2 }),
          date: dDaily,
          description: exp.desc,
          type: "expense",
          actorId: clara.id,
          userId: clara.id,
          sourceAccountId: faker.helpers.arrayElement([
            claraNubank.id, 
            claraBB.id, 
            claraInter.id
          ]),
          vaultId: claraVault.id,
          categoryId: getCat(clara.id, exp.cat).id,
          paymentMethod: faker.helpers.arrayElement(["Cartão de Débito", "PIX", "Crédito"]),
        },
      });
    }
  }

  // 7. Transações Recorrentes e Parceladas para Clara Beatriz
  console.log("🔄 Adicionando transações recorrentes e parceladas...");

  // Transações Recorrentes
  const recurringExpenses = [
    { desc: "Netflix Premium", amount: -55.9, cat: "Assinaturas" },
    { desc: "Seguro de Vida Bradesco", amount: -85.0, cat: "Saúde" },
    { desc: "Plano de Saúde Unimed", amount: -450.0, cat: "Saúde" },
    { desc: "Academia BlueFit", amount: -119.9, cat: "Lazer" },
  ];

  for (const exp of recurringExpenses) {
    await prisma.transaction.create({
      data: {
        amount: exp.amount,
        date: now,
        description: exp.desc,
        type: "expense",
        isRecurring: true,
        actorId: clara.id,
        userId: clara.id,
        sourceAccountId: claraNubank.id,
        vaultId: claraVault.id,
        categoryId: getCat(clara.id, exp.cat).id,
        paymentMethod: "Cartão de Crédito",
      },
    });
  }

  // Pagamentos Parcelados (Despesas)
  // MacBook Pro - 12 parcelas, já pagas 3
  for (let i = 1; i <= 12; i++) {
    const dPC = new Date(now);
    dPC.setMonth(now.getMonth() - (3 - i)); // i=1 -> 2 meses atrás, i=2 -> 1 mês atrás, i=3 -> hoje, etc.

    await prisma.transaction.create({
      data: {
        amount: -1000.0, // Total 12.000
        date: dPC,
        description: `MacBook Pro 14" (Parcela ${i}/12)`,
        type: "expense",
        isInstallment: true,
        installmentNumber: i,
        totalInstallments: 12,
        actorId: clara.id,
        userId: clara.id,
        sourceAccountId: claraItauCard.id,
        vaultId: claraVault.id,
        categoryId: getCat(clara.id, "Investimentos").id,
        paymentMethod: "Cartão de Crédito",
      },
    });
  }

  // Curso de Design - 6 parcelas, já pagas 2
  for (let i = 1; i <= 6; i++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - (2 - i));

    await prisma.transaction.create({
      data: {
        amount: -400.0, // Total 2.400
        date: date,
        description: `Curso Design System Expert (Parcela ${i}/6)`,
        type: "expense",
        isInstallment: true,
        installmentNumber: i,
        totalInstallments: 6,
        actorId: clara.id,
        userId: clara.id,
        sourceAccountId: claraNubank.id,
        vaultId: claraVault.id,
        categoryId: getCat(clara.id, "Educação").id,
        paymentMethod: "Cartão de Crédito",
      },
    });
  }

  // Entradas Parceladas (Incomes)
  // Venda Notebook Antigo - 3 parcelas, já paga 1
  for (let i = 1; i <= 3; i++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - (1 - i));

    await prisma.transaction.create({
      data: {
        amount: 1000.0, // Total 3.000
        date: date,
        description: `Venda MacBook Air Usado (Parcela ${i}/3)`,
        type: "income",
        isInstallment: true,
        installmentNumber: i,
        totalInstallments: 3,
        actorId: clara.id,
        userId: clara.id,
        sourceAccountId: claraInter.id,
        vaultId: claraVault.id,
        categoryId: getCat(clara.id, "Freelance").id,
        paymentMethod: "PIX",
      },
    });
  }

  // Atualizar montantes das metas
  const goalsToUpdate = [travelGoal, houseGoal, reserveGoal, sofaGoal, iphoneGoal, confraGoal];
  for (const goal of goalsToUpdate) {
    const total = await prisma.transaction.aggregate({
      where: { goalId: goal.id },
      _sum: { amount: true },
    });
    await prisma.goal.update({
      where: { id: goal.id },
      data: { currentAmount: total._sum.amount || 0 },
    });
  }

  const finalJapan = await prisma.goal.findUnique({ where: { id: travelGoal.id } });
  const finalHouse = await prisma.goal.findUnique({ where: { id: houseGoal.id } });
  const finalReserve = await prisma.goal.findUnique({ where: { id: reserveGoal.id } });

  console.log("✨ Seeding concluído com sucesso!");
  console.log(`✅ Usuários: ${clara.name}, ${joao.name}, ${ana.name}, ${beto.name}`);
  console.log(
    `✅ Caixinhas: Japão (${finalJapan?.currentAmount.toFixed(2)}), Reforma (${finalHouse?.currentAmount.toFixed(2)}), Reserva (${finalReserve?.currentAmount.toFixed(2)})`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
