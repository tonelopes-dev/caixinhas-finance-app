import type { Transaction, Goal, User, Account, Vault, VaultInvitation, GoalParticipant } from './definitions';

// --- PERSONAS & USERS ---
export const users: User[] = [
  {
    id: 'user1',
    name: 'Dev',
    email: 'email01@conta.com',
    avatarUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=1080',
  },
  {
    id: 'user2',
    name: 'Nutri',
    email: 'email02@conta.com',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080',
  },
   { id: 'user3', name: 'Carlos', email: 'carlos@example.com', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080' },
   { id: 'user4', name: 'Daniela', email: 'daniela@example.com', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1080' },
   { id: 'user5', name: 'Eduardo', email: 'eduardo@example.com', avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1080' },
   { id: 'user6', name: 'Fernanda', email: 'fernanda@example.com', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080' },
   { id: 'user7', name: 'Gabriel', email: 'gabriel@example.com', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=1080' },
   { id: 'user8', name: 'Helena', email: 'helena@example.com', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080' },
];

const dev = users.find(u => u.id === 'user1')!;
const nutri = users.find(u => u.id === 'user2')!;

// --- COFRES ---
export const vaults: Vault[] = [
  {
    id: 'vault-family',
    name: 'Família DevNutri',
    ownerId: dev.id,
    members: [dev, nutri],
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080'
  },
  {
    id: 'vault-agency',
    name: 'Agência Dev',
    ownerId: dev.id,
    members: [dev],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080'
  },
   {
    id: 'vault-office',
    name: 'Consultório Nutri',
    ownerId: nutri.id,
    members: [nutri],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1080'
  }
];

export const vaultInvitations: VaultInvitation[] = [];


// --- DADOS BANCÁRIOS ---
export const bankLogos = [
    'https://cdn.worldvectorlogo.com/logos/nubank-1.svg',
    'https://cdn.worldvectorlogo.com/logos/banco-inter.svg',
    'https://cdn.worldvectorlogo.com/logos/c6-bank.svg',
    'https://cdn.worldvectorlogo.com/logos/itau-unibanco-2.svg',
    'https://cdn.worldvectorlogo.com/logos/bradesco-logo-2.svg',
    'https://cdn.worldvectorlogo.com/logos/banco-do-brasil-logo.svg',
    'https://cdn.worldvectorlogo.com/logos/caixa-economica-federal.svg',
]

// Cada usuário tem suas próprias contas
export const accounts: Account[] = [
  // Contas do Dev
  { id: 'acc-dev-1', ownerId: 'user1', name: 'Conta Pessoal Dev', bank: 'Banco Digital', type: 'checking', logoUrl: bankLogos[0] },
  { id: 'acc-dev-2', ownerId: 'user1', name: 'Investimentos Dev', bank: 'Corretora', type: 'investment', logoUrl: bankLogos[2] },
  
  // Contas da Nutri
  { id: 'acc-nutri-1', ownerId: 'user2', name: 'Conta Pessoal Nutri', bank: 'Banco Inter', type: 'checking', logoUrl: bankLogos[1] },
  
  // Conta do Cofre da Família (Exemplo de conta conjunta)
  { id: 'acc-family', ownerId: 'vault-family', name: 'Conta Conjunta Família', bank: 'Banco Tradicional', type: 'savings', logoUrl: bankLogos[4] },
];

// --- PARTICIPANTES DE METAS ---
const devParticipant: GoalParticipant = { id: dev.id, name: dev.name, avatarUrl: dev.avatarUrl, role: 'owner' };
const nutriParticipant: GoalParticipant = { id: nutri.id, name: nutri.name, avatarUrl: nutri.avatarUrl, role: 'owner' };
const friendsParticipants: GoalParticipant[] = [
    nutriParticipant,
    ...users.slice(2, 5).map(u => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl, role: 'member' as const }))
];

// --- METAS (CAIXINHAS) ---
export const goals: Goal[] = [
  // == Metas do Dev (ownerId: user1) ==
  {
    id: 'goal-dev-personal-1',
    ownerId: 'user1',
    ownerType: 'user',
    name: 'Moto Nova',
    targetAmount: 40000,
    currentAmount: 15000,
    emoji: '🏍️',
    visibility: 'private', 
    participants: [devParticipant],
    isFeatured: true,
  },

  // == Metas da Nutri (ownerId: user2) ==
  {
    id: 'goal-nutri-personal-1',
    ownerId: 'user2',
    ownerType: 'user',
    name: 'Viagem com Amigos',
    targetAmount: 5000,
    currentAmount: 1200,
    emoji: '🏖️',
    visibility: 'shared', // Compartilhada com amigos, não com o Dev
    participants: friendsParticipants, 
    isFeatured: true,
  },
  {
    id: 'goal-nutri-personal-2',
    ownerId: 'user2',
    ownerType: 'user',
    name: 'Pós-graduação',
    targetAmount: 18000,
    currentAmount: 11000,
    emoji: '🎓',
    visibility: 'private',
    participants: [nutriParticipant],
  },
  
  // == Metas do Cofre da Família (ownerId: vault-family) ==
  {
    id: 'goal-family-1',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Reforma da Cozinha',
    targetAmount: 35000,
    currentAmount: 8000,
    emoji: '🛠️',
    visibility: 'shared', // Todos no cofre podem ver
    participants: [devParticipant, nutriParticipant],
    isFeatured: true,
  },
   {
    id: 'goal-family-2',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Fundo de Emergência Familiar',
    targetAmount: 50000,
    currentAmount: 32000,
    emoji: '🛡️',
    visibility: 'shared',
    participants: [devParticipant, nutriParticipant],
  },
];


// --- TRANSAÇÕES ---
export const transactions: Transaction[] = [
    // Transações Pessoais do Dev (user1)
    { id: 't-dev-1', ownerId: 'user1', ownerType: 'user', date: '2024-07-28', description: 'Salário Agência', amount: 12000, type: 'income', category: 'Salário', destinationAccountId: 'acc-dev-1', actorId: 'user1' },
    { id: 't-dev-2', ownerId: 'user1', ownerType: 'user', date: '2024-07-25', description: 'Almoço', amount: 50, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc-dev-1', paymentMethod: 'debit_card', actorId: 'user1' },
    { id: 't-dev-3', ownerId: 'user1', ownerType: 'user', date: '2024-07-20', description: 'Depósito para a Moto', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-dev-1', destinationAccountId: 'goal-dev-personal-1', actorId: 'user1' },
    { id: 't-dev-4', ownerId: 'user1', ownerType: 'user', date: '2024-07-15', description: 'Contribuição para o Cofre da Família', amount: 1500, type: 'transfer', category: 'Transferência', sourceAccountId: 'acc-dev-1', destinationAccountId: 'acc-family', actorId: 'user1' },
    
    // Transações Pessoais da Nutri (user2)
    { id: 't-nutri-1', ownerId: 'user2', ownerType: 'user', date: '2024-07-29', description: 'Recebimento Consultório', amount: 7000, type: 'income', category: 'Salário', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2', ownerId: 'user2', ownerType: 'user', date: '2024-07-26', description: 'Jantar com amigos', amount: 120, type: 'expense', category: 'Lazer', sourceAccountId: 'acc-nutri-1', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-nutri-3', ownerId: 'user2', ownerType: 'user', date: '2024-07-18', description: 'Depósito Viagem Amigos', amount: 300, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'goal-nutri-personal-1', actorId: 'user2' },
    { id: 't-nutri-4', ownerId: 'user2', ownerType: 'user', date: '2024-07-16', description: 'Contribuição para o Cofre da Família', amount: 1500, type: 'transfer', category: 'Transferência', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'acc-family', actorId: 'user2' },

    // Transações do Cofre da Família (vault-family)
    { id: 't-fam-1', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-27', description: 'Supermercado do Mês', amount: 1800, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc-family', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-fam-2', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },
    { id: 't-fam-3', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-15', description: 'Depósito Reforma Cozinha', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-family', destinationAccountId: 'goal-family-1', actorId: 'user2' },
    { id: 't-fam-4', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-28', description: 'Recebimento de Contribuição (Dev)', amount: 1500, type: 'income', category: 'Transferência', destinationAccountId: 'acc-family', actorId: 'user1' },
    { id: 't-fam-5', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-28', description: 'Recebimento de Contribuição (Nutri)', amount: 1500, type: 'income', category: 'Transferência', destinationAccountId: 'acc-family', actorId: 'user2' },
];

// --- LÓGICA DE SIMULAÇÃO ---

// Mock user and partner data, kept for simplicity in some components
export const user: User = users.find(u => u.id === 'user1')!;
export const partner: User = users.find(u => u.id === 'user2')!;

// Mock goal invitations for the UI
export const invitations = [
  {
    id: '1',
    goalName: 'Viagem para a Praia',
    invitedBy: 'Amigo do Dev',
    status: 'pending' as const,
    type: 'goal' as const,
  },
   {
    id: '2',
    goalName: 'Cofre dos Formandos',
    invitedBy: 'Colega da Nutri',
    status: 'pending' as const,
    type: 'vault' as const,
  },
];


export const getMockDataForUser = (userId: string | null) => {
    if (!userId) {
        return { 
            currentUser: null, 
            userAccounts: [],
            userTransactions: [],
            userGoals: [],
            userVaults: [],
            userInvitations: []
        };
    }

    const currentUser = users.find(u => u.id === userId) || null;
    
    // Data related to the user's personal account
    const userAccounts = accounts.filter(a => a.ownerId === userId);
    const userTransactions = transactions.filter(t => t.ownerId === userId && t.ownerType === 'user');
    const userGoals = goals.filter(g => g.ownerId === userId && g.ownerType === 'user' || g.participants?.some(p => p.id === userId));

    // Vaults the user is a member of
    const userVaults = vaults.filter(v => v.members.some(m => m.id === userId));
    
    // Could add invitation logic here
    const userInvitations: VaultInvitation[] = [];
    
    return {
        currentUser,
        userAccounts,
        userTransactions,
        userGoals,
        userVaults,
        userInvitations
    };
};
