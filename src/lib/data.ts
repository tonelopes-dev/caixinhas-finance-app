
import type { Transaction, Goal, User, Partner, Invitation, Guest, Account, Vault, VaultInvitation, GoalParticipant } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

// --- USERS ---
export const users: User[] = [
  {
    id: 'user1',
    name: 'Ana',
    email: 'email01@conta.com',
    avatarUrl: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=1080',
  },
  {
    id: 'user2',
    name: 'Bruno',
    email: 'email02@conta.com',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1080',
  },
   {
    id: 'user3',
    name: 'Carlos',
    email: 'carlos@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080',
  },
  {
    id: 'user4',
    name: 'Daniela',
    email: 'daniela@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1080',
  },
  { id: 'user5', name: 'Eduardo', email: 'eduardo@example.com', avatarUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=1080' },
  { id: 'user6', name: 'Fernanda', email: 'fernanda@example.com', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080' },
  { id: 'user7', name: 'Gabriel', email: 'gabriel@example.com', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=1080' },
  { id: 'user8', name: 'Helena', email: 'helena@example.com', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080' },
  { id: 'user9', name: 'Igor', email: 'igor@example.com', avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1080' },
  { id: 'user10', name: 'Julia', email: 'julia@example.com', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080' },
];


// --- VAULTS ---
export const vaults: Vault[] = [
  {
    id: 'vault1',
    name: 'Minha Agência',
    ownerId: 'user1',
    members: [users.find(u => u.id === 'user1')!],
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1080'
  },
  {
    id: 'vault2',
    name: 'Contas Família',
    ownerId: 'user1',
    members: [users.find(u => u.id === 'user1')!, users.find(u => u.id === 'user2')!],
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080'
  },
  {
    id: 'vault3',
    name: 'Projeto Freelance',
    ownerId: 'user3',
    members: [users.find(u => u.id === 'user3')!, users.find(u => u.id === 'user4')!],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080'
  },
   {
    id: 'vault4',
    name: 'Festa de Fim de Ano',
    ownerId: 'user4',
    members: [users.find(u => u.id === 'user4')!],
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1080'
  }
];

// --- INVITATIONS ---
export const vaultInvitations: VaultInvitation[] = [
    { id: 'invite1', vaultId: 'vault3', vaultName: 'Projeto Freelance', invitedBy: 'Carlos', status: 'pending' }, // For user1
    { id: 'invite2', vaultId: 'vault4', vaultName: 'Festa de Fim de Ano', invitedBy: 'Daniela', status: 'pending' }, // For user1
];


export const user: User = users.find(u => u.id === 'user1')!;
export const partner: User = users.find(u => u.id === 'user2')!;

export const guests: Guest[] = [
    {
        id: 'partner',
        name: partner.name,
        email: partner.email,
        avatarUrl: partner.avatarUrl,
    },
    ...users.slice(2, 10).map(u => ({ id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl }))
];

export const bankLogos = [
    'https://cdn.worldvectorlogo.com/logos/nubank-1.svg',
    'https://cdn.worldvectorlogo.com/logos/banco-inter.svg',
    'https://cdn.worldvectorlogo.com/logos/c6-bank.svg',
    'https://cdn.worldvectorlogo.com/logos/itau-unibanco-2.svg',
    'https://cdn.worldvectorlogo.com/logos/bradesco-logo-2.svg',
    'https://cdn.worldvectorlogo.com/logos/banco-do-brasil-logo.svg',
    'https://cdn.worldvectorlogo.com/logos/caixa-economica-federal.svg',
]

export const accounts: Account[] = [
  { id: 'acc1', name: 'Conta Principal', bank: 'Banco Digital', type: 'checking', logoUrl: bankLogos[0] },
  { id: 'acc2', name: 'Poupança Conjunta', bank: 'Banco Tradicional', type: 'savings', logoUrl: bankLogos[4] },
  { id: 'acc3', name: 'Carteira', bank: 'Dinheiro Físico', type: 'other' },
];

const familyMembers: GoalParticipant[] = [
    { id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: 'owner' },
    { id: partner.id, name: partner.name, avatarUrl: partner.avatarUrl, role: 'member' }
];

const agencyMembers: GoalParticipant[] = [
    { id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: 'owner' }
];

const disneyTripParticipants: GoalParticipant[] = [
    ...familyMembers,
    ...users.slice(4, 10).map(u => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl, role: 'member' as const }))
];


export const goals: Goal[] = [
  // === COFRE AGÊNCIA (vault1) ===
  // 3 da agência
  {
    id: 'goal1',
    vaultId: 'vault1',
    name: 'Macbook Novo',
    targetAmount: 15000,
    currentAmount: 7500,
    emoji: '💻',
    visibility: 'private', // Privada da agência
    participants: agencyMembers,
    isFeatured: true,
  },
  {
    id: 'goal2',
    vaultId: 'vault1',
    name: 'Cadeira Ergonômica',
    targetAmount: 3000,
    currentAmount: 1500,
    emoji: '💺',
    visibility: 'shared', // Compartilhada na agência (mas só tem 1 membro)
    participants: agencyMembers,
  },
   {
    id: 'goal-agency-3',
    vaultId: 'vault1',
    name: 'Licença de Software',
    targetAmount: 1200,
    currentAmount: 1200,
    emoji: '📄',
    visibility: 'private',
    participants: agencyMembers,
  },
  // 2 compartilhadas com a família
  {
    id: 'goal-shared-1',
    vaultId: 'vault1',
    name: 'Fundo de Emergência',
    targetAmount: 10000,
    currentAmount: 9800,
    emoji: '🛡️',
    visibility: 'shared',
    participants: familyMembers,
    isFeatured: true,
  },
  {
    id: 'goal-shared-2',
    vaultId: 'vault1',
    name: 'Reforma Escritório/Casa',
    targetAmount: 22000,
    currentAmount: 4000,
    emoji: '🛠️',
    visibility: 'shared',
    participants: familyMembers,
  },

  // === COFRE FAMÍLIA (vault2) ===
  // 2 compartilhadas vindas da agência (mesmos IDs)
   {
    id: 'goal-shared-1',
    vaultId: 'vault2',
    name: 'Fundo de Emergência',
    targetAmount: 10000,
    currentAmount: 9800,
    emoji: '🛡️',
    visibility: 'shared',
    participants: familyMembers,
    isFeatured: true,
  },
  {
    id: 'goal-shared-2',
    vaultId: 'vault2',
    name: 'Reforma Escritório/Casa',
    targetAmount: 22000,
    currentAmount: 4000,
    emoji: '🛠️',
    visibility: 'shared',
    participants: familyMembers,
  },
  // 1 compartilhada com 6+ pessoas
  {
    id: 'goal3',
    vaultId: 'vault2',
    name: 'Viagem para a Disney',
    targetAmount: 25000,
    currentAmount: 19500,
    emoji: '✈️',
    visibility: 'shared',
    participants: disneyTripParticipants,
    isFeatured: true,
  },
  // 2 privadas
   {
    id: 'goal-family-private-1',
    vaultId: 'vault2',
    name: 'Presente Surpresa B.',
    targetAmount: 500,
    currentAmount: 150,
    emoji: '🎁',
    visibility: 'private',
    participants: [familyMembers[0]], // Só para Ana
  },
  {
    id: 'goal-family-private-2',
    vaultId: 'vault2',
    name: 'Curso de Culinária',
    targetAmount: 800,
    currentAmount: 800,
    emoji: '🍳',
    visibility: 'private',
    participants: [familyMembers[1]], // Só para Bruno
  },
  // 2 compartilhadas só com a família
   {
    id: 'goal-family-shared-1',
    vaultId: 'vault2',
    name: 'Trocar de Carro',
    targetAmount: 70000,
    currentAmount: 35000,
    emoji: '🚗',
    visibility: 'shared',
    participants: familyMembers,
  },
  {
    id: 'goal-family-shared-2',
    vaultId: 'vault2',
    name: 'Educação das Crianças',
    targetAmount: 150000,
    currentAmount: 15000,
    emoji: '🎓',
    visibility: 'shared',
    participants: familyMembers,
  },
  
  // Goal para outro cofre (não deve aparecer para user1 ou user2)
  {
    id: 'goal5',
    vaultId: 'vault3',
    name: 'Setup de Gravação',
    targetAmount: 8000,
    currentAmount: 1250,
    emoji: '🎙️',
    visibility: 'shared',
  },
];


export const transactions: Transaction[] = [
    // Transactions for "Minha Agência" (vault1)
    { id: '1', vaultId: 'vault1', date: '2024-07-28', description: 'Pagto. Cliente A - Site', amount: 5000, type: 'income', category: 'Serviços', destinationAccountId: 'acc1', actorId: 'user1' },
    { id: '2', vaultId: 'vault1', date: '2024-07-25', description: 'Pagto. Cliente B - Automação', amount: 3500, type: 'income', category: 'Serviços', destinationAccountId: 'acc1', actorId: 'user1' },
    { id: '3', vaultId: 'vault1', date: '2024-07-22', description: 'Assinatura Software de Design', amount: 250.00, type: 'expense', category: 'Software', sourceAccountId: 'acc1', paymentMethod: 'credit_card', actorId: 'user1' },
    { id: '4', vaultId: 'vault1', date: '2024-07-20', description: 'Anúncios Online', amount: 400.00, type: 'expense', category: 'Marketing', sourceAccountId: 'acc1', paymentMethod: 'boleto', actorId: 'user1' },

    // Transactions for "Contas Família" (vault2)
    { id: '5', vaultId: 'vault2', date: '2024-07-28', description: 'Salário Ana', amount: 3000, type: 'income', category: 'Salário', destinationAccountId: 'acc2', actorId: 'user1' },
    { id: '6', vaultId: 'vault2', date: '2024-07-28', description: 'Salário Bruno', amount: 2500, type: 'income', category: 'Salário', destinationAccountId: 'acc2', actorId: 'user2' },
    { id: '7', vaultId: 'vault2', date: '2024-07-27', description: 'Supermercado do Mês', amount: 850.75, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc2', paymentMethod: 'debit_card', actorId: 'user1' },
    { id: '8', vaultId: 'vault2', date: '2024-07-26', description: 'Aluguel', amount: 1800.00, type: 'expense', category: 'Casa', sourceAccountId: 'acc2', paymentMethod: 'transfer', actorId: 'user1' },
];


export const invitations: Invitation[] = [
  {
    id: '1',
    goalName: 'Carro Novo',
    invitedBy: 'Maria',
    status: 'pending',
  },
   {
    id: '2',
    goalName: 'Festa de Casamento',
    invitedBy: 'João',
    status: 'pending',
  },
  {
    id: '3',
    goalName: 'Cofre da Família',
    invitedBy: 'Seus Pais',
    status: 'pending',
    type: 'vault'
  },
  {
    id: '4',
    goalName: 'Reforma da Casa',
    invitedBy: 'Arquiteto',
    status: 'pending',
  }
];

export const totalIncome = transactions
  .filter(t => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0);

export const totalExpenses = transactions
  .filter(t => t.type === 'expense')
  .reduce((sum, t) => sum + t.amount, 0);

// --- MOCK DATA LOGIC ---
export const getMockDataForUser = (userId: string | null) => {
    if (!userId) {
        return { userVaults: [], userInvitations: [] };
    }

    const userVaults = vaults.filter(v => v.ownerId === userId || v.members.some(m => m.id === userId));

    let userInvitations: VaultInvitation[] = [];
    if (userId === 'user1') {
        // User 1 is invited to vault3 and vault4
        userInvitations = vaultInvitations;
    } else if (userId === 'user2') {
        // User 2 has no invitations in this scenario
        userInvitations = [];
    }
    
    return {
        userVaults,
        userInvitations,
    };
};
