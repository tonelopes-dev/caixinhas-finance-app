import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf267ddc?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1520692739414-a95267425121?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1542155734-b203a9f029a1?auto=format&fit=crop&q=80&w=400&h=400',
];

const VAULT_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
  'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
];

async function main() {
  console.log('Iniciando o seeding do banco de dados...');

  // Limpeza de dados existentes
  console.log('Deletando dados existentes...');
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.goalParticipant.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.vaultMember.deleteMany();
  await prisma.vault.deleteMany();
  await prisma.user.deleteMany();
  console.log('Dados existentes deletados.');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Criar Usuários
  console.log('Criando usuários...');
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Silva',
      email: 'alice@example.com',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[0],
      subscriptionStatus: 'active',
      trialExpiresAt: faker.date.future({ years: 1 }),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bruno Costa',
      email: 'bruno@example.com',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[1],
      subscriptionStatus: 'active',
      trialExpiresAt: faker.date.future({ years: 1 }),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Carlos Mendes',
      email: 'carlos@example.com',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[2],
      subscriptionStatus: 'trial',
      trialExpiresAt: faker.date.soon({ days: 15 }), // Corrigido
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Diana Rosa',
      email: 'diana@example.com',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[3],
      subscriptionStatus: 'trial',
      trialExpiresAt: faker.date.past({ years: 1 }), 
    },
  });

  const userInvitedEmail = 'eva@example.com'; 

  console.log('Usuários criados:', { user1: user1.email, user2: user2.email, user3: user3.email, user4: user4.email });

  // 2. Criar Categorias
  console.log('Criando categorias...');
  // Supondo que Category tem um campo ownerId
  const categoriesData = [
    { name: 'Alimentação', ownerId: user1.id }, 
    { name: 'Transporte', ownerId: user1.id },
    { name: 'Lazer', ownerId: user1.id },
    { name: 'Salário', ownerId: user1.id },
    { name: 'Contas de Casa', ownerId: user2.id },
  ];
  await prisma.category.createMany({ data: categoriesData });
  const createdCategories = await prisma.category.findMany();
  console.log('Categorias criadas.');

  // 3. Criar Cofres (Vaults)
  console.log('Criando cofres...');
  const vault1 = await prisma.vault.create({
    data: {
      name: 'Finanças Pessoais Alice',
      imageUrl: VAULT_IMAGE_URLS[0],
      isPrivate: true,
      ownerId: user1.id, // ID direto
      members: {
        create: { userId: user1.id, role: 'owner' }, // ID direto
      },
    },
  });

  const vault2 = await prisma.vault.create({
    data: {
      name: 'Viagem dos Sonhos',
      imageUrl: VAULT_IMAGE_URLS[1],
      isPrivate: false,
      ownerId: user1.id, // ID direto
      members: {
        create: [
          { userId: user1.id, role: 'owner' }, // ID direto
          { userId: user2.id, role: 'member' }, // ID direto
        ],
      },
    },
  });

  const vault3 = await prisma.vault.create({
    data: {
      name: 'Compras do Mês',
      imageUrl: VAULT_IMAGE_URLS[2],
      isPrivate: false,
      ownerId: user2.id, // ID direto
      members: {
        create: [
          { userId: user2.id, role: 'owner' }, // ID direto
          { userId: user1.id, role: 'member' }, // ID direto
          { userId: user3.id, role: 'member' }, // ID direto
        ],
      },
    },
  });

  console.log('Cofres criados:', { vault1: vault1.name, vault2: vault2.name, vault3: vault3.name });

  // 4. Criar Convites
  console.log('Criando convites...');
  // Convite pendente de user1 para userInvitedEmail (usuário não existente)
  const invite1 = await prisma.invitation.create({
    data: {
      type: 'vault',
      targetId: vault2.id,
      targetName: vault2.name,
      senderId: user1.id, // ID direto
      receiverEmail: userInvitedEmail,
      status: 'pending',
    },
  });

  // Convite pendente de user2 para user3 (usuário existente)
  const invite2 = await prisma.invitation.create({
    data: {
      type: 'vault',
      targetId: vault1.id,
      targetName: vault1.name,
      senderId: user2.id, // ID direto
      receiverId: user3.id, // ID direto
      receiverEmail: user3.email,
      status: 'pending',
    },
  });
  console.log('Convites pendentes criados.');

  // 5. Criar Contas
  console.log('Criando contas...');
  const account1 = await prisma.account.create({
    data: {
      name: 'Conta Corrente Alice',
      bank: 'Banco do Brasil',
      type: 'corrente',
      balance: 1500.00,
      scope: vault1.id,
      ownerId: user1.id, // ID correto
      vaultId: vault1.id, // ID direto
    },
  });

  const account2 = await prisma.account.create({
    data: {
      name: 'Poupança Conjunta',
      bank: 'Caixa Econômica',
      type: 'poupanca',
      balance: 5000.00,
      scope: vault2.id,
      ownerId: user1.id, // ID correto
      vaultId: vault2.id, // ID direto
    },
  });

  const account3 = await prisma.account.create({
    data: {
      name: 'Cartão de Crédito Bruno',
      bank: 'Nubank',
      type: 'credito',
      balance: -300.00,
      creditLimit: 2000.00,
      scope: vault3.id,
      ownerId: user2.id, // ID correto
      vaultId: vault3.id, // ID direto
    },
  });
  console.log('Contas criadas.');

  // 6. Criar Metas (Goals/Caixinhas)
  console.log('Criando metas (caixinhas)...');
  const goal1 = await prisma.goal.create({
    data: {
      name: 'Reserva de Emergência',
      targetAmount: 10000.00,
      currentAmount: 2500.00,
      emoji: '🚨',
      visibility: 'private',
      isFeatured: true,
      userId: user1.id, // ID direto
      participants: {
        create: { userId: user1.id, role: 'owner' }, // ID direto
      },
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      name: 'Passagem Aérea',
      targetAmount: 3000.00,
      currentAmount: 1200.00,
      emoji: '✈️',
      visibility: 'shared',
      isFeatured: false,
      vaultId: vault2.id, // ID direto
      participants: {
        create: [
          { userId: user1.id, role: 'member' }, // ID direto
          { userId: user2.id, role: 'member' }, // ID direto
        ],
      },
    },
  });

  const goal3 = await prisma.goal.create({
    data: {
      name: 'Presente para Amigo',
      targetAmount: 150.00,
      currentAmount: 0.00,
      emoji: '🎁',
      visibility: 'shared',
      isFeatured: false,
      vaultId: vault3.id, // ID direto
      participants: {
        create: [
          { userId: user1.id, role: 'member' }, // ID direto
          { userId: user2.id, role: 'member' }, // ID direto
        ],
      },
    },
  });

  console.log('Metas (caixinhas) criadas.');

  // 7. Criar Transações
  console.log('Criando transações...');
  await prisma.transaction.create({
    data: {
      amount: 200.00,
      date: faker.date.recent(),
      description: 'Depósito inicial reserva',
      type: 'income',
      paymentMethod: 'pix',
      sourceAccountId: account1.id, // ID correto
      categoryId: createdCategories.find(c => c.name === 'Salário')?.id!, // ID direto
      actorId: user1.id, // Obrigatório
      userId: user1.id, // ID direto
      vaultId: vault1.id, // ID direto
    },
  });

  await prisma.transaction.create({
    data: {
      amount: -50.00,
      date: faker.date.recent(),
      description: 'Supermercado Extra',
      type: 'expense',
      paymentMethod: 'debito',
      sourceAccountId: account1.id, // ID correto
      categoryId: createdCategories.find(c => c.name === 'Alimentação')?.id!, // ID direto
      actorId: user1.id, // Obrigatório
      userId: user1.id, // ID direto
      vaultId: vault1.id, // ID direto
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 100.00,
      date: faker.date.recent(),
      description: 'Contribuição viagem',
      type: 'income',
      paymentMethod: 'pix',
      sourceAccountId: account2.id, // ID correto
      goalId: goal2.id, // ID direto
      actorId: user1.id, // Obrigatório
      userId: user1.id, // ID direto
      vaultId: vault2.id, // ID direto
    },
  });

  await prisma.transaction.create({
    data: {
      amount: -70.00,
      date: faker.date.recent(),
      description: 'Uber',
      type: 'expense',
      paymentMethod: 'credito',
      sourceAccountId: account3.id, // ID correto
      categoryId: createdCategories.find(c => c.name === 'Transporte')?.id!, // ID direto
      actorId: user2.id, // Obrigatório
      userId: user2.id, // ID direto
      vaultId: vault3.id, // ID direto
    },
  });
  console.log('Transações criadas.');

  // 8. Criar Notificações
  console.log('Criando notificações...');
  await prisma.notification.create({
    data: {
      userId: user1.id, // ID direto
      type: 'system',
      message: 'Bem-vindo ao Caixinhas! Explore seus cofres.',
      link: '/dashboard',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user3.id, // ID direto
      type: 'vault_invite',
      message: `${user2.name} convidou você para o cofre '${vault1.name}'.`,
      link: '/invitations',
      relatedId: invite2.id,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user2.id, // ID direto
      type: 'goal_progress',
      message: `Sua meta '${goal2.name}' atingiu 40% do objetivo!`,
      link: `/goals/${goal2.id}`,
      isRead: true,
    },
  });
  console.log('Notificações criadas.');

  console.log('Seeding concluído com sucesso!');
} 

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
