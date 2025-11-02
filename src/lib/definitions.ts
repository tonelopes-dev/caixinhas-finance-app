export type Account = {
  id: string;
  name: string;
  bank: string;
  type: 'checking' | 'savings' | 'investment' | 'other';
  logoUrl?: string;
  ownerId: string; // userId
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
  // ownerId pode ser um userId ou um vaultId
  ownerId: string; 
  ownerType: 'user' | 'vault';
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'transfer' | 'boleto' | 'cash';
  // Ids de Account
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
  id:string;
  // ownerId pode ser um userId ou um vaultId
  ownerId: string;
  ownerType: 'user' | 'vault';
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  // visibilidade dentro do seu contexto (pessoal ou cofre)
  visibility: 'private' | 'shared'; 
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
