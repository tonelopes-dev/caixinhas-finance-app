import type { Transaction, Goal, User, Partner, Invitation, Guest } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

export const user: User = {
  name: 'Você',
  email: 'seuemail@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl ?? '',
};

export const partner: Partner = {
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

export const goals: Goal[] = [
  {
    id: '1',
    name: 'Viagem para a Europa',
    targetAmount: 20000,
    currentAmount: 7500,
    emoji: '✈️',
    visibility: 'private',
    participants: [
        { id: 'user', name: 'Você', avatarUrl: user.avatarUrl, role: 'owner' },
        { id: 'p1', name: 'Beatriz', avatarUrl: 'https://picsum.photos/seed/101/100', role: 'member' },
        { id: 'p2', name: 'Carlos', avatarUrl: 'https://picsum.photos/seed/102/100', role: 'member' },
        { id: 'p3', name: 'Daniela', avatarUrl: 'https://picsum.photos/seed/103/100', role: 'member' },
        { id: 'p4', name: 'Eduardo', avatarUrl: 'https://picsum.photos/seed/104/100', role: 'member' },
        { id: 'p5', name: 'Fernanda', avatarUrl: 'https://picsum.photos/seed/105/100', role: 'member' },
        { id: 'p6', name: 'Gabriel', avatarUrl: 'https://picsum.photos/seed/106/100', role: 'member' },
        { id: 'p7', name: 'Heloísa', avatarUrl: 'https://picsum.photos/seed/107/100', role: 'member' },
        { id: 'p8', name: 'Igor', avatarUrl: 'https://picsum.photos/seed/108/100', role: 'member' },
        { id: 'p9', name: 'Juliana', avatarUrl: 'https://picsum.photos/seed/109/100', role: 'member' },
    ]
  },
  {
    id: '2',
    name: 'Apartamento Novo',
    targetAmount: 50000,
    currentAmount: 15000,
    emoji: '🏡',
    visibility: 'shared',
  },
  {
    id: '3',
    name: 'Fundo de Emergência',
    targetAmount: 10000,
    currentAmount: 9500,
    emoji: '🛡️',
    visibility: 'private',
  },
  {
    id: '4',
    name: 'Videogame Novo',
    targetAmount: 3500,
    currentAmount: 3450,
    emoji: '🎮',
    visibility: 'private',
  },
  {
    id: '5',
    name: 'Carro Elétrico',
    targetAmount: 250000,
    currentAmount: 2500,
    emoji: '🚗',
    visibility: 'shared',
  },
  {
    id: '6',
    name: 'Presente Surpresa',
    targetAmount: 800,
    currentAmount: 800,
    emoji: '🎁',
    visibility: 'private',
  },
  {
    id: '7',
    name: 'Festa de Casamento',
    targetAmount: 30000,
    currentAmount: 12000,
    emoji: '💍',
    visibility: 'shared',
  },
];

export const transactions: Transaction[] = [
    { id: '1', date: '2024-07-25', description: 'Salário', amount: 3000, type: 'income', category: 'Salário' },
    { id: '2', date: '2024-07-25', description: 'Salário Parceiro(a)', amount: 2500, type: 'income', category: 'Salário' },
    { id: '3', date: '2024-07-24', description: 'Supermercado', amount: 450.75, type: 'expense', category: 'Alimentação' },
    { id: '4', date: '2024-07-23', description: 'Conta de Luz', amount: 150.00, type: 'expense', category: 'Casa' },
    { id: '5', date: '2024-07-22', description: 'Cinema', amount: 80.00, type: 'expense', category: 'Lazer' },
    { id: '6', date: '2024-07-21', description: 'Gasolina', amount: 120.00, type: 'expense', category: 'Transporte' },
    { id: '7', date: '2024-07-20', description: 'Jantar fora', amount: 200.50, type: 'expense', category: 'Lazer' },
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
  }
];

export const totalIncome = transactions
  .filter(t => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0);

export const totalExpenses = transactions
  .filter(t => t.type === 'expense')
  .reduce((sum, t) => sum + t.amount, 0);
