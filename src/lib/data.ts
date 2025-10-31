
import type { Transaction, Goal, User, Partner, Invitation, Guest, Account } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

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
  {
    id: 'goal1',
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
    id: 'goal2',
    name: 'Apartamento Novo',
    targetAmount: 50000,
    currentAmount: 15000,
    emoji: '🏡',
    visibility: 'shared',
  },
  {
    id: 'goal3',
    name: 'Fundo de Emergência',
    targetAmount: 10000,
    currentAmount: 9500,
    emoji: '🛡️',
    visibility: 'private',
  },
  {
    id: 'goal4',
    name: 'Videogame Novo',
    targetAmount: 3500,
    currentAmount: 3450,
    emoji: '🎮',
    visibility: 'private',
  },
  {
    id: 'goal5',
    name: 'Carro Elétrico',
    targetAmount: 250000,
    currentAmount: 2500,
    emoji: '🚗',
    visibility: 'shared',
  },
  {
    id: 'goal6',
    name: 'Presente Surpresa',
    targetAmount: 800,
    currentAmount: 800,
    emoji: '🎁',
    visibility: 'private',
  },
  {
    id: 'goal7',
    name: 'Festa de Casamento',
    targetAmount: 30000,
    currentAmount: 12000,
    emoji: '💍',
    visibility: 'shared',
  },
];


export const transactions: Transaction[] = [
    // July
    { id: '1', date: '2024-07-28', description: 'Salário', amount: 3000, type: 'income', category: 'Salário', destinationAccountId: 'acc1' },
    { id: '2', date: '2024-07-28', description: 'Salário Parceiro(a)', amount: 2500, type: 'income', category: 'Salário', destinationAccountId: 'acc2' },
    { id: '3', date: '2024-07-27', description: 'Supermercado', amount: 450.75, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc2', paymentMethod: 'credit_card' },
    { id: '4', date: '2024-07-26', description: 'Conta de Luz', amount: 150.00, type: 'expense', category: 'Casa', sourceAccountId: 'acc1', paymentMethod: 'boleto' },
    { id: '5', date: '2024-07-25', description: 'Cinema', amount: 80.00, type: 'expense', category: 'Lazer', sourceAccountId: 'acc1', paymentMethod: 'debit_card' },
    { id: '6', date: '2024-07-24', description: 'Gasolina', amount: 120.00, type: 'expense', category: 'Transporte', sourceAccountId: 'acc2', paymentMethod: 'pix' },
    { id: '7', date: '2024-07-23', description: 'Jantar fora', amount: 200.50, type: 'expense', category: 'Lazer', sourceAccountId: 'acc1', paymentMethod: 'credit_card' },
    { id: '8', date: '2024-07-22', description: 'Depósito Caixinha Europa', amount: 500, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc1', destinationAccountId: 'goal1' },
    { id: '9', date: '2024-07-21', description: 'Depósito Caixinha Apto', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc2', destinationAccountId: 'goal2' },
    { id: '10', date: '2024-07-20', description: 'Saque', amount: 100, type: 'expense', category: 'Outros', sourceAccountId: 'acc1', paymentMethod: 'cash' },
    { id: '11', date: '2024-07-19', description: 'Retirada Caixinha Fundo Emergência', amount: 200, type: 'transfer', category: 'Caixinha', sourceAccountId: 'goal3', destinationAccountId: 'acc1' },
    { id: '12', date: '2024-07-18', description: 'Rendimento Freelance', amount: 800, type: 'income', category: 'Freelance', destinationAccountId: 'acc1' },
    { id: '13', date: '2024-07-17', description: 'Assinatura Streaming', amount: 45.90, type: 'expense', category: 'Utilidades', sourceAccountId: 'acc1', paymentMethod: 'credit_card' },
    { id: '14', date: '2024-07-16', description: 'Farmácia', amount: 75.20, type: 'expense', category: 'Saúde', sourceAccountId: 'acc2', paymentMethod: 'debit_card' },
    { id: '15', date: '2024-07-15', description: 'Depósito Caixinha Casamento', amount: 300, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc1', destinationAccountId: 'goal7' },
    { id: '16', date: '2024-07-10', description: 'Compra Online (Roupas)', amount: 250, type: 'expense', category: 'Roupas', sourceAccountId: 'acc1', paymentMethod: 'pix' },
    { id: '17', date: '2024-07-05', description: 'Mensalidade Academia', amount: 120, type: 'expense', category: 'Saúde', sourceAccountId: 'acc2', paymentMethod: 'debit_card' },
    
    // June
    { id: '18', date: '2024-06-28', description: 'Salário', amount: 3000, type: 'income', category: 'Salário', destinationAccountId: 'acc1' },
    { id: '19', date: '2024-06-28', description: 'Salário Parceiro(a)', amount: 2500, type: 'income', category: 'Salário', destinationAccountId: 'acc2' },
    { id: '20', date: '2024-06-25', description: 'Aluguel', amount: 1500, type: 'expense', category: 'Casa', sourceAccountId: 'acc2', paymentMethod: 'transfer' },
    { id: '21', date: '2024-06-20', description: 'Supermercado', amount: 600, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc1', paymentMethod: 'credit_card' },
    { id: '22', date: '2024-06-15', description: 'Presente Aniversário', amount: 150, type: 'expense', category: 'Presentes', sourceAccountId: 'acc1', paymentMethod: 'pix' },
    { id: '23', date: '2024-06-10', description: 'Depósito Caixinha Apto', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc2', destinationAccountId: 'goal2' },

    // May
    { id: '24', date: '2024-05-28', description: 'Salário', amount: 2900, type: 'income', category: 'Salário', destinationAccountId: 'acc1' },
    { id: '25', date: '2024-05-28', description: 'Salário Parceiro(a)', amount: 2500, type: 'income', category: 'Salário', destinationAccountId: 'acc2' },
    { id: '26', date: '2024-05-15', description: 'Viagem Fim de Semana', amount: 800, type: 'expense', category: 'Lazer', sourceAccountId: 'acc1', paymentMethod: 'credit_card' },
    { id: '27', date: '2024-05-10', description: 'Manutenção Carro', amount: 450, type: 'expense', category: 'Transporte', sourceAccountId: 'acc2', paymentMethod: 'debit_card' },
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
