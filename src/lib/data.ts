
import type { Transaction, Goal, User, Partner, Invitation, Guest, Account, Vault, VaultInvitation } from './definitions';
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
    { id: 'invite2', vaultId: 'vault4', vaultName: 'Festa de Fim de Ano', invitedBy: 'Daniela', status: 'pending' }, // For user1 (changed from user2 to user1 for test case)
];


export const user: User = {
  id: 'user',
  name: 'Você',
  email: 'seuemail@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl ?? '',
};

export const partner: Partner = {
  id: 'partner',
  name: 'Parceiro(a)',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'partner-avatar')?.imageUrl ?? '',
};

export const guests: Guest[] = [
    {
        id: '1',
        name: 'Parceiro(a)',
        email: 'parceiro@example.com',
        avatarUrl: PlaceHolderImages.find(img => img.id === 'partner-avatar')?.imageUrl ?? '',
    },
    {
        id: '2',
        name: 'Maria Silva',
        email: 'maria.silva@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1080',
    }
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

export const goals: Goal[] = [
  // Goals for "Minha Agência" (vault1)
  {
    id: 'goal1',
    vaultId: 'vault1',
    name: 'Macbook Novo',
    targetAmount: 15000,
    currentAmount: 7500,
    emoji: '💻',
    visibility: 'private',
    isFeatured: true,
  },
  {
    id: 'goal2',
    vaultId: 'vault1',
    name: 'Cadeira Ergonômica',
    targetAmount: 3000,
    currentAmount: 1500,
    emoji: '💺',
    visibility: 'shared',
  },
  // Goals for "Contas Família" (vault2)
  {
    id: 'goal3',
    vaultId: 'vault2',
    name: 'Viagem para a Disney',
    targetAmount: 25000,
    currentAmount: 19500,
    emoji: '✈️',
    visibility: 'shared',
    isFeatured: true,
  },
  {
    id: 'goal4',
    vaultId: 'vault2',
    name: 'Fundo de Emergência',
    targetAmount: 10000,
    currentAmount: 9800,
    emoji: '🛡️',
    visibility: 'shared',
  },
  // Other goals for other vaults
  {
    id: 'goal5',
    vaultId: 'vault3',
    name: 'Carro Elétrico',
    targetAmount: 250000,
    currentAmount: 2500,
    emoji: '🚗',
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
