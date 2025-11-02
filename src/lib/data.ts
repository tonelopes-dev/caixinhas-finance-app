import type { Transaction, Goal, User, Partner, Invitation, Guest, Account, Vault, VaultInvitation, GoalParticipant } from './definitions';

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

// --- VAULTS (COFRES) ---
export const vaults: Vault[] = [
  {
    id: 'vault-dev',
    name: 'Agência de Software',
    ownerId: dev.id,
    members: [dev],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080'
  },
  {
    id: 'vault-family',
    name: 'Família DevNutri',
    ownerId: dev.id,
    members: [dev, nutri],
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080'
  },
  {
    id: 'vault-nutri',
    name: 'Consultório Nutri',
    ownerId: nutri.id,
    members: [nutri],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1080'
  }
];

// --- INVITATIONS ---
export const vaultInvitations: VaultInvitation[] = [
    // Simula que a Nutri foi convidada para o cofre da família, mas já aceitou (por isso está na lista de membros)
    // Poderíamos ter convites pendentes aqui para outros usuários
];

// --- DADOS GERAIS ---
export const user: User = users.find(u => u.id === 'user1')!; // Mock user principal
export const partner: User = users.find(u => u.id === 'user2')!;

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
  { id: 'acc-dev-pj', name: 'Conta PJ Agência', bank: 'Banco Digital', type: 'checking', logoUrl: bankLogos[0] },
  { id: 'acc-nutri-pj', name: 'Conta PJ Consultório', bank: 'Banco Inter', type: 'checking', logoUrl: bankLogos[1] },
  { id: 'acc-family', name: 'Conta Conjunta Família', bank: 'Banco Tradicional', type: 'savings', logoUrl: bankLogos[4] },
];


// --- GOAL PARTICIPANTS ---
const familyParticipants: GoalParticipant[] = [
    { id: dev.id, name: dev.name, avatarUrl: dev.avatarUrl, role: 'owner' },
    { id: nutri.id, name: nutri.name, avatarUrl: nutri.avatarUrl, role: 'member' }
];
const devAgencyParticipants: GoalParticipant[] = [{ id: dev.id, name: dev.name, avatarUrl: dev.avatarUrl, role: 'owner' }];
const nutriOfficeParticipants: GoalParticipant[] = [{ id: nutri.id, name: nutri.name, avatarUrl: nutri.avatarUrl, role: 'owner' }];
const vacationParticipants: GoalParticipant[] = [
    ...familyParticipants,
    ...users.slice(2, 6).map(u => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl, role: 'member' as const }))
];


// --- GOALS (CAIXINHAS) ---
export const goals: Goal[] = [
  // == Cofre: Família DevNutri (vault-family) ==
  {
    id: 'goal-family-shared-1',
    vaultId: 'vault-family',
    name: 'Viagem de Férias',
    targetAmount: 25000,
    currentAmount: 19500,
    emoji: '✈️',
    visibility: 'shared', // Qualquer membro do cofre "Família" vê
    participants: vacationParticipants,
    isFeatured: true,
  },
  {
    id: 'goal-family-shared-2',
    vaultId: 'vault-family',
    name: 'Fundo de Emergência',
    targetAmount: 30000,
    currentAmount: 29500,
    emoji: '🛡️',
    visibility: 'shared',
    participants: familyParticipants,
    isFeatured: true,
  },
  {
    id: 'goal-family-private-dev',
    vaultId: 'vault-family',
    name: 'Presente Surpresa (Nutri)',
    targetAmount: 1500,
    currentAmount: 700,
    emoji: '🎁',
    visibility: 'private', // Apenas o Dev (owner) e quem ele convidar
    participants: [devAgencyParticipants[0]],
  },
   {
    id: 'goal-family-private-nutri',
    vaultId: 'vault-family',
    name: 'Curso de Especialização',
    targetAmount: 4000,
    currentAmount: 3500,
    emoji: '🎓',
    visibility: 'private', // Apenas a Nutri (owner) e quem ela convidar
    participants: [nutriOfficeParticipants[0]],
  },

  // == Cofre: Agência de Software (vault-dev) ==
  {
    id: 'goal-dev-1',
    vaultId: 'vault-dev',
    name: 'Setup Novo (Monitor, Cadeira)',
    targetAmount: 12000,
    currentAmount: 5000,
    emoji: '🖥️',
    visibility: 'shared', // "shared" dentro do cofre da agência (só o Dev vê)
    participants: devAgencyParticipants,
    isFeatured: true,
  },
  {
    id: 'goal-dev-2',
    vaultId: 'vault-dev',
    name: 'Licenças de Software Anual',
    targetAmount: 2500,
    currentAmount: 1800,
    emoji: '📄',
    visibility: 'shared',
    participants: devAgencyParticipants,
  },
  // Esta é a mesma caixinha do cofre da família, compartilhada aqui.
  {
    id: 'goal-family-shared-2',
    vaultId: 'vault-dev',
    name: 'Fundo de Emergência',
    targetAmount: 30000,
    currentAmount: 29500,
    emoji: '🛡️',
    visibility: 'shared',
    participants: familyParticipants, // Participantes ainda são a família
  },
  
  // == Cofre: Consultório Nutri (vault-nutri) ==
  {
    id: 'goal-nutri-1',
    vaultId: 'vault-nutri',
    name: 'Equipamento de Bioimpedância',
    targetAmount: 18000,
    currentAmount: 11000,
    emoji: '⚖️',
    visibility: 'shared', // "shared" dentro do cofre do consultório (só a Nutri vê)
    participants: nutriOfficeParticipants,
    isFeatured: true,
  },
  // Esta é a mesma caixinha do cofre da família, compartilhada aqui.
   {
    id: 'goal-family-shared-2',
    vaultId: 'vault-nutri',
    name: 'Fundo de Emergência',
    targetAmount: 30000,
    currentAmount: 29500,
    emoji: '🛡️',
    visibility: 'shared',
    participants: familyParticipants,
  },
];


export const transactions: Transaction[] = [
    // Agência
    { id: 't-dev-1', vaultId: 'vault-dev', date: '2024-07-28', description: 'Pagto. Cliente A', amount: 8000, type: 'income', category: 'Serviços', destinationAccountId: 'acc-dev-pj', actorId: 'user1' },
    { id: 't-dev-2', vaultId: 'vault-dev', date: '2024-07-22', description: 'Assinatura Figma', amount: 350, type: 'expense', category: 'Software', sourceAccountId: 'acc-dev-pj', paymentMethod: 'credit_card', actorId: 'user1' },
    { id: 't-dev-3', vaultId: 'vault-dev', date: '2024-07-20', description: 'Transferência para Fundo Emergência', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-dev-pj', destinationAccountId: 'goal-family-shared-2', actorId: 'user1' },

    // Família
    { id: 't-fam-1', vaultId: 'vault-family', date: '2024-07-28', description: 'Salário Dev', amount: 4000, type: 'income', category: 'Salário', destinationAccountId: 'acc-family', actorId: 'user1' },
    { id: 't-fam-2', vaultId: 'vault-family', date: '2024-07-28', description: 'Salário Nutri', amount: 4500, type: 'income', category: 'Salário', destinationAccountId: 'acc-family', actorId: 'user2' },
    { id: 't-fam-3', vaultId: 'vault-family', date: '2024-07-27', description: 'Supermercado', amount: 950, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc-family', paymentMethod: 'debit_card', actorId: 'user2' },
    { id: 't-fam-4', vaultId: 'vault-family', date: '2024-07-26', description: 'Aluguel', amount: 2200, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'transfer', actorId: 'user1' },
    { id: 't-fam-5', vaultId: 'vault-family', date: '2024-07-15', description: 'Depósito Viagem', amount: 2000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-family', destinationAccountId: 'goal-family-shared-1', actorId: 'user2' },
    { id: 't-fam-6', vaultId: 'vault-family', date: '2024-07-10', description: 'Depósito Surpresa Nutri', amount: 250, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-family', destinationAccountId: 'goal-family-private-dev', actorId: 'user1' },
    
    // Consultório
    { id: 't-nutri-1', vaultId: 'vault-nutri', date: '2024-07-29', description: 'Consulta Paciente X', amount: 250, type: 'income', category: 'Consultas', destinationAccountId: 'acc-nutri-pj', actorId: 'user2' },
    { id: 't-nutri-2', vaultId: 'vault-nutri', date: '2024-07-25', description: 'Aluguel Sala', amount: 1200, type: 'expense', category: 'Aluguel', sourceAccountId: 'acc-nutri-pj', paymentMethod: 'transfer', actorId: 'user2' },
    { id: 't-nutri-3', vaultId: 'vault-nutri', date: '2024-07-18', description: 'Depósito Bioimpedância', amount: 1500, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-nutri-pj', destinationAccountId: 'goal-nutri-1', actorId: 'user2' },
];


export const invitations: Invitation[] = [
  {
    id: '1',
    goalName: 'Viagem para a Praia',
    invitedBy: 'Amigo do Dev',
    status: 'pending',
    type: 'goal'
  },
   {
    id: '2',
    goalName: 'Cofre dos Formandos',
    invitedBy: 'Colega da Nutri',
    status: 'pending',
    type: 'vault'
  },
];


// --- MOCK DATA LOGIC ---
export const getMockDataForUser = (userId: string | null) => {
    if (!userId) {
        return { userVaults: [], userInvitations: [], userGoals: [] };
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
        return { userVaults: [], userInvitations: [], userGoals: [] };
    }
    
    // User is a member of these vaults
    const userVaults = vaults.filter(v => v.members.some(m => m.id === userId));
    
    // User is a participant in these goals
    const userGoals = goals.filter(g => g.participants?.some(p => p.id === userId));

    let userInvitations: VaultInvitation[] = [];
    // Could add logic here to give specific users pending vault invitations
    
    return {
        currentUser: user,
        userVaults,
        userInvitations,
        userGoals
    };
};
