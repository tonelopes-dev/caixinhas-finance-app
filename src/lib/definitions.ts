export type Account = {
  id: string;
  name: string;
  bank: string;
  type: 'checking' | 'savings' | 'investment' | 'other';
  logoUrl?: string;
};

export type Vault = {
  id: string;
  name: string;
  ownerId: string;
  members: User[];
  imageUrl: string;
}

export type VaultInvitation = {
  id: string;
  vaultId: string;
  vaultName: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
}


export type Transaction = {
  id: string;
  vaultId: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'transfer' | 'boleto' | 'cash';
  sourceAccountId?: string;
  destinationAccountId?: string;
  actorId?: string;
};

export type GoalParticipant = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'owner' | 'member';
}

export type Goal = {
  id: string;
  vaultId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  visibility: 'shared' | 'private';
  participants?: GoalParticipant[];
  isFeatured?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Partner = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Invitation = {
  id: string;
  goalName: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  type?: 'goal' | 'vault';
};

export type Guest = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
}
