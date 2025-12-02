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
      emailVerified: faker.date.recent(),
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
      emailVerified: faker.date.recent(),
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
      emailVerified: faker.date.recent(),
      subscriptionStatus: 'trial',
      trialExpiresAt: faker.date.future({ days: 15 }), // Trial expira em 15 dias
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Diana Rosa',
      email: 'diana@example.com',
      password: hashedPassword,
      avatarUrl: AVATAR_URLS[3],
      emailVerified: faker.date.recent(),
      subscriptionStatus: 'trial',
      trialExpiresAt: faker.date.past({ years: 1 }), // Trial expirado
    },
  });

  const userInvitedEmail = 'eva@example.com'; // E-mail para um usuário que não existe ainda

  console.log('Usuários criados:', { user1: user1.email, user2: user2.email, user3: user3.email, user4: user4.email });

  // 2. Criar Categorias
  console.log('Criando categorias...');
  const categories = [
    { name: 'Alimentação', userId: user1.id },
    { name: 'Transporte', userId: user1.id },
    { name: 'Lazer', userId: user1.id },
    { name: 'Salário', userId: user1.id },
    { name: 'Contas de Casa', userId: user2.id },
  ];
  await prisma.category.createMany({ data: categories });
  const createdCategories = await prisma.category.findMany();
  console.log('Categorias criadas.');

  // 3. Criar Cofres (Vaults)
  console.log('Criando cofres...');
  const vault1 = await prisma.vault.create({
    data: {
      name: 'Finanças Pessoais Alice',
      imageUrl: VAULT_IMAGE_URLS[0],
      isPrivate: true,
      ownerId: user1.id,
      members: {
        create: { userId: user1.id, role: 'owner' },
      },
    },
  });

  const vault2 = await prisma.vault.create({
    data: {
      name: 'Viagem dos Sonhos',
      imageUrl: VAULT_IMAGE_URLS[1],
      isPrivate: false,
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: 'owner' },
          { userId: user2.id, role: 'member' },
        ],
      },
    },
  });

  const vault3 = await prisma.vault.create({
    data: {
      name: 'Compras do Mês',
      imageUrl: VAULT_IMAGE_URLS[2],
      isPrivate: false,
      ownerId: user2.id,
      members: {
        create: [
          { userId: user2.id, role: 'owner' },
          { userId: user1.id, role: 'member' },
          { userId: user3.id, role: 'member' },
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
      senderId: user1.id,
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
      senderId: user2.id,
      receiverId: user3.id,
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
      balance: 1500.00,
      userId: user1.id,
      vaultId: vault1.id, // Associada ao cofre pessoal de Alice
    },
  });

  const account2 = await prisma.account.create({
    data: {
      name: 'Poupança Conjunta',
      balance: 5000.00,
      userId: user1.id, // Alice é a proprietária da conta, mas ela está no cofre2
      vaultId: vault2.id, // Associada ao cofre de viagem
    },
  });

  const account3 = await prisma.account.create({
    data: {
      name: 'Cartão de Crédito Bruno',
      balance: -300.00,
      userId: user2.id,
      vaultId: vault3.id, // Associada ao cofre de compras
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
      userId: user1.id,
      participants: {
        create: { userId: user1.id, role: 'owner' },
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
      vaultId: vault2.id, // Meta do cofre de viagem
      participants: {
        create: [
          { userId: user1.id, role: 'member' },
          { userId: user2.id, role: 'member' },
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
      vaultId: vault3.id, // Meta do cofre de compras
      participants: {
        create: [
          { userId: user1.id, role: 'member' },
          { userId: user2.id, role: 'member' },
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
      accountId: account1.id,
      categoryId: createdCategories.find(c => c.name === 'Salário')?.id,
      userId: user1.id,
      vaultId: vault1.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 50.00,
      date: faker.date.recent(),
      description: 'Almoço',
      type: 'expense',
      accountId: account1.id,
      categoryId: createdCategories.find(c => c.name === 'Alimentação')?.id,
      userId: user1.id,
      vaultId: vault1.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 100.00,
      date: faker.date.recent(),
      description: 'Contribuição viagem',
      type: 'income',
      accountId: account2.id,
      goalId: goal2.id,
      userId: user1.id,
      vaultId: vault2.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 70.00,
      date: faker.date.recent(),
      description: 'Uber',
      type: 'expense',
      accountId: account3.id,
      categoryId: createdCategories.find(c => c.name === 'Transporte')?.id,
      userId: user2.id,
      vaultId: vault3.id,
    },
  });
  console.log('Transações criadas.');

  // 8. Criar Notificações
  console.log('Criando notificações...');
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'system',
      message: 'Bem-vindo ao Caixinhas! Explore seus cofres.',
      link: '/dashboard',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user3.id,
      type: 'vault_invite',
      message: `${user2.name} convidou você para o cofre '${vault1.name}'.`,
      link: '/invitations',
      relatedId: invite2.id,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user2.id,
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
