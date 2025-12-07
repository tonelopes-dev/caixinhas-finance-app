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

  // 1. Criar Usuários com Avatars Específicos
  console.log('Criando usuários...');
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
      trialExpiresAt: faker.date.soon({ days: 15 }),
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
      trialExpiresAt: faker.date.past({ years: 1 }), // Trial expirado
      workspaceImageUrl: '/screenshots/main-dashboard.png',
    },
  });

  const invitedEmail = 'novo.membro@caixinhas.app'; // Email para convite pendente

  console.log('Usuários criados:', {
    user1: user1.email,
    user2: user2.email,
    user3: user3.email,
    user4: user4.email,
  });

  // 2. Criar Cofres (Vaults)
  console.log('Criando cofres (vaults)...');

  // Cofre Compartilhado (user1, user2, user3)
  const sharedVault = await prisma.vault.create({
    data: {
      name: 'Cofre da Família Tech',
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

  // Cofre Individual Privado para user1
  const claraPersonalVault = await prisma.vault.create({
    data: {
      name: 'Sonhos da Clara',
      imageUrl: VAULT_IMAGE_URLS[3],
      isPrivate: true,
      ownerId: user1.id,
      members: {
        create: { userId: user1.id, role: 'owner' },
      },
    },
  });

  // Cofre Individual Privado para user2
  const joaoPersonalVault = await prisma.vault.create({
    data: {
      name: 'Projetos do João',
      imageUrl: VAULT_IMAGE_URLS[4],
      isPrivate: true,
      ownerId: user2.id,
      members: {
        create: { userId: user2.id, role: 'owner' },
      },
    },
  });

  // Cofre para o usuário com trial expirado (user4)
  const marcosPersonalVault = await prisma.vault.create({
    data: {
      name: 'Investimentos Marcos',
      imageUrl: VAULT_IMAGE_URLS[5],
      isPrivate: true,
      ownerId: user4.id,
      members: {
        create: { userId: user4.id, role: 'owner' },
      },
    },
  });


  console.log('Cofres criados:', {
    shared: sharedVault.name,
    clara: claraPersonalVault.name,
    joao: joaoPersonalVault.name,
    marcos: marcosPersonalVault.name,
  });

  // 3. Criar Categorias
  console.log('Criando categorias...');
  const categoriesData = [
    { name: 'Salário', ownerId: user1.id },
    { name: 'Freelance', ownerId: user1.id },
    { name: 'Alimentação', ownerId: user1.id },
    { name: 'Transporte', ownerId: user1.id },
    { name: 'Lazer', ownerId: user1.id },
    { name: 'Moradia', ownerId: user1.id },
    { name: 'Educação', ownerId: user2.id },
    { name: 'Saúde', ownerId: user2.id },
    { name: 'Roupas', ownerId: user3.id },
    { name: 'Investimentos', ownerId: user4.id },
  ];
  await prisma.category.createMany({ data: categoriesData });
  const createdCategories = await prisma.category.findMany(); // Busca todas as categorias criadas

  const catAlimentacaoUser1 = createdCategories.find(c => c.name === 'Alimentação' && c.ownerId === user1.id)!;
  const catSalarioUser1 = createdCategories.find(c => c.name === 'Salário' && c.ownerId === user1.id)!;
  const catTransporteUser1 = createdCategories.find(c => c.name === 'Transporte' && c.ownerId === user1.id)!;
  const catLazerUser1 = createdCategories.find(c => c.name === 'Lazer' && c.ownerId === user1.id)!;
  const catEducacaoUser2 = createdCategories.find(c => c.name === 'Educação' && c.ownerId === user2.id)!;
  const catSaudeUser2 = createdCategories.find(c => c.name === 'Saúde' && c.ownerId === user2.id)!;
  const catRoupasUser3 = createdCategories.find(c => c.name === 'Roupas' && c.ownerId === user3.id)!;
  const catInvestimentosUser4 = createdCategories.find(c => c.name === 'Investimentos' && c.ownerId === user4.id)!;


  console.log('Categorias criadas.');

  // 4. Criar Contas
  console.log('Criando contas...');

  // Contas para Clara (user1) no Cofre Pessoal
  const claraAccount1 = await prisma.account.create({
    data: {
      name: 'Conta Corrente Clara',
      bank: 'Banco Digital S.A.',
      type: 'corrente',
      balance: 2500.00,
      scope: claraPersonalVault.id,
      ownerId: user1.id,
      vaultId: claraPersonalVault.id,
    },
  });

  const claraAccount2 = await prisma.account.create({
    data: {
      name: 'Poupança Investimento',
      bank: 'Invest Fácil',
      type: 'poupanca',
      balance: 7000.00,
      scope: claraPersonalVault.id,
      ownerId: user1.id,
      vaultId: claraPersonalVault.id,
    },
  });

  // Contas para João (user2) no Cofre Pessoal
  const joaoAccount1 = await prisma.account.create({
    data: {
      name: 'Conta Corrente João',
      bank: 'Bank XPTO',
      type: 'corrente',
      balance: 1800.00,
      scope: joaoPersonalVault.id,
      ownerId: user2.id,
      vaultId: joaoPersonalVault.id,
    },
  });

  // Conta Compartilhada no Cofre da Família Tech
  const sharedAccount1 = await prisma.account.create({
    data: {
      name: 'Conta Compartilhada Família',
      bank: 'MultiBank',
      type: 'corrente',
      balance: 1200.00,
      scope: sharedVault.id,
      ownerId: user1.id, // O owner é um dos membros do cofre compartilhado
      vaultId: sharedVault.id,
    },
  });

  const joaoCreditCard = await prisma.account.create({
    data: {
      name: 'Cartão de Crédito João',
      bank: 'CrediMais',
      type: 'credito',
      balance: -450.00, // Fatura atual
      creditLimit: 3000.00,
      scope: joaoPersonalVault.id,
      ownerId: user2.id,
      vaultId: joaoPersonalVault.id,
    },
  });


  console.log('Contas criadas.');

  // 5. Criar Metas (Goals/Caixinhas)
  console.log('Criando metas (caixinhas)...');

  // Caixinha Privada para Clara (user1) no Cofre Pessoal
  const claraGoal1 = await prisma.goal.create({
    data: {
      name: 'Reserva de Emergência Clara',
      targetAmount: 15000.00,
      currentAmount: 5000.00,
      emoji: '🚨',
      visibility: 'private',
      isFeatured: true,
      userId: user1.id,
      participants: {
        create: { userId: user1.id, role: 'owner' },
      },
    },
  });

  // Caixinha Compartilhada (user1, user2, user3) no Cofre da Família Tech
  const sharedGoal1 = await prisma.goal.create({
    data: {
      name: 'Viagem em Família 2025',
      targetAmount: 10000.00,
      currentAmount: 3000.00,
      emoji: '✈️',
      visibility: 'shared',
      isFeatured: true,
      vaultId: sharedVault.id,
      participants: {
        create: [
          { userId: user1.id, role: 'member' },
          { userId: user2.id, role: 'member' },
          { userId: user3.id, role: 'member' },
        ],
      },
    },
  });

  // Caixinha Privada para João (user2) no Cofre Pessoal
  const joaoGoal1 = await prisma.goal.create({
    data: {
      name: 'Novo Computador',
      targetAmount: 8000.00,
      currentAmount: 2000.00,
      emoji: '💻',
      visibility: 'private',
      isFeatured: false,
      userId: user2.id,
      participants: {
        create: { userId: user2.id, role: 'owner' },
      },
    },
  });

  // Caixinha para o usuário com trial expirado (user4)
  const marcosGoal1 = await prisma.goal.create({
    data: {
      name: 'Reforma da Casa',
      targetAmount: 20000.00,
      currentAmount: 1000.00,
      emoji: '🏡',
      visibility: 'private',
      isFeatured: false,
      userId: user4.id,
      participants: {
        create: { userId: user4.id, role: 'owner' },
      },
    },
  });


  console.log('Metas (caixinhas) criadas.');

  // 6. Criar Transações
  console.log('Criando transações...');

  // Transações para Clara (user1) no Cofre Pessoal
  await prisma.transaction.create({
    data: {
      amount: 3000.00,
      date: faker.date.recent({ days: 30 }),
      description: 'Salário Mensal',
      type: 'income',
      paymentMethod: 'transferencia',
      sourceAccountId: claraAccount1.id,
      categoryId: catSalarioUser1.id,
      actorId: user1.id,
      userId: user1.id,
      vaultId: claraPersonalVault.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: -120.50,
      date: faker.date.recent({ days: 10 }),
      description: 'Jantar com amigos',
      type: 'expense',
      paymentMethod: 'debito',
      sourceAccountId: claraAccount1.id,
      categoryId: catLazerUser1.id,
      actorId: user1.id,
      userId: user1.id,
      vaultId: claraPersonalVault.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 500.00,
      date: faker.date.recent({ days: 5 }),
      description: 'Transferência para Reserva de Emergência',
      type: 'income', // Pode ser um "transfer" em um sistema mais complexo, mas como income aqui
      paymentMethod: 'pix',
      sourceAccountId: claraAccount1.id,
      goalId: claraGoal1.id,
      actorId: user1.id,
      userId: user1.id,
      vaultId: claraPersonalVault.id,
    },
  });

  // Transações para João (user2) no Cofre Pessoal
  await prisma.transaction.create({
    data: {
      amount: -80.00,
      date: faker.date.recent({ days: 7 }),
      description: 'Mensalidade Curso Online',
      type: 'expense',
      paymentMethod: 'credito',
      sourceAccountId: joaoCreditCard.id,
      categoryId: catEducacaoUser2.id,
      actorId: user2.id,
      userId: user2.id,
      vaultId: joaoPersonalVault.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: -30.00,
      date: faker.date.recent({ days: 2 }),
      description: 'Combustível',
      type: 'expense',
      paymentMethod: 'debito',
      sourceAccountId: joaoAccount1.id,
      categoryId: catTransporteUser1.id, // Usando categoria de user1 para exemplo
      actorId: user2.id,
      userId: user2.id,
      vaultId: joaoPersonalVault.id,
    },
  });

  // Transação Compartilhada (user1, user2) no Cofre da Família Tech
  await prisma.transaction.create({
    data: {
      amount: -250.00,
      date: faker.date.recent({ days: 15 }),
      description: 'Compras para casa',
      type: 'expense',
      paymentMethod: 'debito',
      sourceAccountId: sharedAccount1.id,
      categoryId: catAlimentacaoUser1.id, // Usando categoria de user1 para exemplo
      actorId: user1.id, // Clara fez a compra
      userId: user1.id, // Clara é o "owner" da transação neste contexto
      vaultId: sharedVault.id,
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 100.00,
      date: faker.date.recent({ days: 12 }),
      description: 'Contribuição para Viagem em Família',
      type: 'income',
      paymentMethod: 'pix',
      sourceAccountId: sharedAccount1.id,
      goalId: sharedGoal1.id,
      actorId: user2.id, // João contribuiu
      userId: user2.id,
      vaultId: sharedVault.id,
    },
  });

  console.log('Transações criadas.');

  // 7. Criar Convites
  console.log('Criando convites...');

  // Convite pendente de user1 para um email de usuário não existente
  const inviteToNewUser = await prisma.invitation.create({
    data: {
      type: 'vault',
      targetId: sharedVault.id,
      targetName: sharedVault.name,
      senderId: user1.id,
      receiverEmail: invitedEmail,
      status: 'pending',
    },
  });

  // Convite pendente de user2 para user4 (usuário existente, mas com trial expirado)
  const inviteToExistingUser = await prisma.invitation.create({
    data: {
      type: 'vault',
      targetId: joaoPersonalVault.id, // Convidando para o cofre pessoal do João
      targetName: joaoPersonalVault.name,
      senderId: user2.id,
      receiverId: user4.id,
      receiverEmail: user4.email,
      status: 'pending',
    },
  });

  console.log('Convites pendentes criados.');

  // 8. Criar Notificações
  console.log('Criando notificações...');

  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'system',
      message: 'Bem-vindo ao Caixinhas! Explore seu novo dashboard.',
      link: '/dashboard',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user3.id,
      type: 'vault_invite',
      message: `${user1.name} te convidou para o cofre '${sharedVault.name}'.`,
      link: '/invitations',
      relatedId: inviteToNewUser.id, // Relacionado ao convite pendente
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user2.id,
      type: 'goal_progress',
      message: `Sua Caixinha '${sharedGoal1.name}' atingiu 30% do objetivo!`,
      link: `/goals/${sharedGoal1.id}`,
      isRead: true,
      createdAt: faker.date.recent({days: 2})
    },
  });

  await prisma.notification.create({
    data: {
      userId: user4.id,
      type: 'system',
      message: 'Seu período de teste expirou. Faça upgrade para continuar acessando todos os recursos!',
      link: '/profile/subscription',
      isRead: false,
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
