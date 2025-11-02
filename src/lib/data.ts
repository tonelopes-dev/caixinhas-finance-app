import type { Transaction, Goal, User, Account, Vault, VaultInvitation, GoalParticipant, Notification } from './definitions';

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

// --- COFRES (VAULTS) ---
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
    name: 'Agência de Software',
    ownerId: dev.id,
    members: [dev], // Apenas o Dev é membro
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080'
  },
   {
    id: 'vault-office',
    name: 'Consultório Nutri',
    ownerId: nutri.id,
    members: [nutri], // Apenas a Nutri é membro
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1080'
  }
];

export const vaultInvitations: VaultInvitation[] = [
  // Exemplo: Dev convidou a Nutri para o cofre da família.
  // Em um app real, o status mudaria para 'accepted' e ela seria adicionada aos membros.
];


// --- DADOS BANCÁRIOS (ACCOUNTS) ---
export const bankLogos = [
    'https://cdn.worldvectorlogo.com/logos/nubank-1.svg',
    'https://cdn.worldvectorlogo.com/logos/banco-inter.svg',
    'https://cdn.worldvectorlogo.com/logos/c6-bank.svg',
    'https://cdn.worldvectorlogo.com/logos/itau-unibanco-2.svg',
    'https://cdn.worldvectorlogo.com/logos/bradesco-logo-2.svg',
    'https://cdn.worldvectorlogo.com/logos/banco-do-brasil-logo.svg',
    'https://cdn.worldvectorlogo.com/logos/caixa-economica-federal.svg',
]

// As contas agora pertencem a um 'user' ou a um 'vault'
export const accounts: Account[] = [
  // Contas Pessoais do Dev (user1)
  { id: 'acc-dev-1', ownerId: 'user1', ownerType: 'user', name: 'Conta Corrente', bank: 'Banco Digital', type: 'checking', balance: 12500, logoUrl: bankLogos[0] },
  { id: 'acc-dev-2', ownerId: 'user1', ownerType: 'user', name: 'Investimentos', bank: 'Corretora Ágil', type: 'investment', balance: 75000, logoUrl: bankLogos[2] },
  { id: 'acc-dev-3', ownerId: 'user1', ownerType: 'user', name: 'Cartão Principal', bank: 'Banco Digital', type: 'credit_card', balance: 0, creditLimit: 15000, logoUrl: bankLogos[0] },
  
  // Contas Pessoais da Nutri (user2)
  { id: 'acc-nutri-1', ownerId: 'user2', ownerType: 'user', name: 'Conta Profissional', bank: 'Banco Verde', type: 'checking', balance: 23000, logoUrl: bankLogos[1] },
  
  // Conta Conjunta do Cofre da Família (vault-family)
  { id: 'acc-family', ownerId: 'vault-family', ownerType: 'vault', name: 'Conta Conjunta', bank: 'Banco Familiar', type: 'checking', balance: 5200, logoUrl: bankLogos[4] },
];

// --- PARTICIPANTES DE METAS ---
const devParticipant: GoalParticipant = { id: dev.id, name: dev.name, avatarUrl: dev.avatarUrl, role: 'owner' };
const nutriParticipant: GoalParticipant = { id: nutri.id, name: nutri.name, avatarUrl: nutri.avatarUrl, role: 'owner' };
const familyParticipants: GoalParticipant[] = [devParticipant, nutriParticipant];
const friendsParticipants: GoalParticipant[] = [
    nutriParticipant,
    ...users.slice(2, 5).map(u => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl, role: 'member' as const }))
];

// --- METAS (CAIXINHAS / GOALS) ---
export const goals: Goal[] = [
  // -- Metas Pessoais do Dev --
  {
    id: 'goal-dev-1',
    ownerId: 'user1',
    ownerType: 'user',
    name: 'Setup Novo',
    targetAmount: 15000,
    currentAmount: 7500,
    emoji: '🖥️',
    visibility: 'private', 
    participants: [devParticipant],
    isFeatured: true,
  },

  // -- Metas Pessoais da Nutri --
  {
    id: 'goal-nutri-1',
    ownerId: 'user2',
    ownerType: 'user',
    name: 'Viagem com Amigos',
    targetAmount: 5000,
    currentAmount: 1200,
    emoji: '🏖️',
    visibility: 'shared',
    participants: friendsParticipants, 
    isFeatured: true,
  },
  
  // -- Metas do Cofre da Agência (Apenas o Dev vê) --
  {
    id: 'goal-agency-1',
    ownerId: 'vault-agency',
    ownerType: 'vault',
    name: 'Macbook M4 Pro',
    targetAmount: 25000,
    currentAmount: 18000,
    emoji: '💻',
    visibility: 'shared',
    participants: [devParticipant],
  },

  // -- Metas do Cofre do Consultório (Apenas a Nutri vê) --
  {
    id: 'goal-office-1',
    ownerId: 'vault-office',
    ownerType: 'vault',
    name: 'Bioimpedância Nova',
    targetAmount: 40000,
    currentAmount: 11000,
    emoji: '🔬',
    visibility: 'shared',
    participants: [nutriParticipant],
  },
  
  // -- Metas do Cofre da Família --
  {
    id: 'goal-family-1',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Reforma da Cozinha',
    targetAmount: 35000,
    currentAmount: 8000,
    emoji: '🛠️',
    visibility: 'shared', // Todos no cofre podem ver
    participants: familyParticipants,
    isFeatured: true,
  },
   {
    id: 'goal-family-2',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Fundo de Emergência',
    targetAmount: 50000,
    currentAmount: 32000,
    emoji: '🛡️',
    visibility: 'shared',
    participants: familyParticipants,
  },
  {
    id: 'goal-family-priv-dev',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Presente Surpresa Nutri',
    targetAmount: 2000,
    currentAmount: 1500,
    emoji: '🎁',
    visibility: 'private', // Só o Dev pode ver
    participants: [devParticipant],
  },
  {
    id: 'goal-family-priv-nutri',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Curso de Culinária',
    targetAmount: 1500,
    currentAmount: 950,
    emoji: '🍳',
    visibility: 'private', // Só a Nutri pode ver
    participants: [nutriParticipant],
  },
];


// --- TRANSAÇÕES (TRANSACTIONS) ---
export const transactions: Transaction[] = [
    // Transações Pessoais do Dev (user1)
    { id: 't-dev-1', ownerId: 'user1', ownerType: 'user', date: '2024-07-28', description: 'Salário', amount: 12000, type: 'income', category: 'Salário', destinationAccountId: 'acc-dev-1', actorId: 'user1', isRecurring: true },
    { id: 't-dev-2', ownerId: 'user1', ownerType: 'user', date: '2024-07-25', description: 'Almoço com cliente', amount: 80, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc-dev-3', paymentMethod: 'credit_card', actorId: 'user1' },
    { id: 't-dev-3', ownerId: 'user1', ownerType: 'user', date: '2024-07-20', description: 'Economia para Setup', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-dev-1', destinationAccountId: 'goal-dev-1', actorId: 'user1' },
    { id: 't-dev-4', ownerId: 'user1', ownerType: 'user', date: '2024-07-15', description: 'Transferência para Cofre Família', amount: 1500, type: 'transfer', category: 'Contribuição Familiar', sourceAccountId: 'acc-dev-1', destinationAccountId: 'acc-family', actorId: 'user1', isRecurring: true },
    
    // Transações Pessoais da Nutri (user2)
    { id: 't-nutri-1', ownerId: 'user2', ownerType: 'user', date: '2024-07-29', description: 'Recebimento de Consultas', amount: 7000, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2', ownerId: 'user2', ownerType: 'user', date: '2024-07-26', description: 'Jantar com amigos', amount: 120, type: 'expense', category: 'Lazer', sourceAccountId: 'acc-nutri-1', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-nutri-3', ownerId: 'user2', ownerType: 'user', date: '2024-07-18', description: 'Economia para Viagem', amount: 300, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'goal-nutri-1', actorId: 'user2' },
    { id: 't-nutri-4', ownerId: 'user2', ownerType: 'user', date: '2024-07-16', description: 'Transferência para Cofre Família', amount: 1500, type: 'transfer', category: 'Contribuição Familiar', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'acc-family', actorId: 'user2', isRecurring: true },

    // Transações do Cofre da Família (vault-family)
    { id: 't-fam-1', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-27', description: 'Supermercado do Mês', amount: 1800, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc-family', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-fam-2', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },
    { id: 't-fam-3', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-15', description: 'Depósito Reforma Cozinha', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-family', destinationAccountId: 'goal-family-1', actorId: 'user2' },
    { id: 't-fam-4', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-15', description: 'Contribuição do Dev', amount: 1500, type: 'income', category: 'Contribuição Familiar', sourceAccountId: 'acc-dev-1', destinationAccountId: 'acc-family', actorId: 'user1' },
    { id: 't-fam-5', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-16', description: 'Contribuição da Nutri', amount: 1500, type: 'income', category: 'Contribuição Familiar', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'acc-family', actorId: 'user2' },

    // Transações do Cofre do Consultório (vault-office)
    { id: 't-off-1', ownerId: 'vault-office', ownerType: 'vault', date: '2024-07-28', description: 'Consulta Paciente A', amount: 350, type: 'income', category: 'Consultas', destinationAccountId: 'acc-nutri-1', paymentMethod: 'pix', actorId: 'user2' },
    { id: 't-off-2', ownerId: 'vault-office', ownerType: 'vault', date: '2024-07-27', description: 'Aluguel do Consultório', amount: 1200, type: 'expense', category: 'Aluguel', sourceAccountId: 'acc-nutri-1', paymentMethod: 'boleto', actorId: 'user2', isRecurring: true },
    { id: 't-off-3', ownerId: 'vault-office', ownerType: 'vault', date: '2024-07-25', description: 'Compra de Suplementos', amount: 450, type: 'expense', category: 'Materiais', sourceAccountId: 'acc-nutri-1', paymentMethod: 'debit_card', actorId: 'user2' },
    { id: 't-off-4', ownerId: 'vault-office', ownerType: 'vault', date: '2024-07-20', description: 'Aporte para Bioimpedância', amount: 2000, type: 'transfer', category: 'Investimento', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'goal-office-1', actorId: 'user2' },
];

// --- NOTIFICAÇÕES ---
export const notifications: Notification[] = [
    {
      id: 'n1',
      type: 'goal_invite',
      actor: users.find(u => u.id === 'user4'),
      text: '<b>Daniela</b> te convidou para a caixinha "Viagem de Fim de Ano".',
      timestamp: '2024-07-29T10:00:00Z',
      read: false,
      link: '/invitations'
    },
     {
      id: 'n2',
      type: 'transaction_added',
      actor: nutri,
      text: '<b>Nutri</b> adicionou uma nova despesa de <b>R$ 1.800,00</b> em "Família DevNutri".',
      timestamp: '2024-07-27T15:30:00Z',
      read: false,
      link: '/transactions'
    },
    {
      id: 'n3',
      type: 'goal_progress',
      text: 'Parabéns! Vocês alcançaram <b>90%</b> da meta "Presente Surpresa Nutri".',
      timestamp: '2024-07-26T11:00:00Z',
      read: true,
      link: '/goals/goal-family-priv-dev'
    },
     {
      id: 'n4',
      type: 'vault_invite',
      actor: users.find(u => u.id === 'user5'),
      text: '<b>Eduardo</b> te convidou para o cofre "Futebol de Quinta".',
      timestamp: '2024-07-25T09:00:00Z',
      read: true,
      link: '/invitations'
    },
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
    
    // Contas Pessoais do usuário e contas de cofres que ele participa
    const userVaults = vaults.filter(v => v.members.some(m => m.id === userId));
    const userVaultIds = userVaults.map(v => v.id);
    const userAccounts = accounts.filter(a => (a.ownerId === userId && a.ownerType === 'user') || (a.ownerType === 'vault' && userVaultIds.includes(a.ownerId)));
    
    // Transações Pessoais e de cofres
    const userTransactions = transactions.filter(t => (t.ownerId === userId && t.ownerType === 'user') || (t.ownerType === 'vault' && userVaultIds.includes(t.ownerId)));
    
    // Metas: Pessoais do usuário + caixinhas de cofres que ele participa
    const userGoals = goals.filter(g => {
      // É uma meta pessoal do usuário
      if (g.ownerId === userId && g.ownerType === 'user') {
        return true;
      }
      // É uma meta de um cofre que o usuário participa
      if (g.ownerType === 'vault' && userVaultIds.includes(g.ownerId)) {
        // Se for pública no cofre, ele vê. Se for privada, ele precisa ser um participante.
        return g.visibility === 'shared' || g.participants?.some(p => p.id === userId);
      }
      // Outros casos: meta pessoal de outro usuário que ele foi convidado
      return g.participants?.some(p => p.id === userId);
    });
    
    // Convites pendentes (lógica de exemplo)
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
