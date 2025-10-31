import type { Transaction, Goal, User, Partner, Invitation } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

export const user: User = {
  name: 'Você',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl ?? '',
};

export const partner: Partner = {
  name: 'Parceiro(a)',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'partner-avatar')?.imageUrl ?? '',
};

export const goals: Goal[] = [
  {
    id: '1',
    name: 'Viagem para a Europa',
    targetAmount: 20000,
    currentAmount: 7500,
    emoji: '✈️',
  },
  {
    id: '2',
    name: 'Apartamento Novo',
    targetAmount: 50000,
    currentAmount: 15000,
    emoji: '🏡',
  },
  {
    id: '3',
    name: 'Fundo de Emergência',
    targetAmount: 10000,
    currentAmount: 9500,
    emoji: '🛡️',
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
